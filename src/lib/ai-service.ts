import { Annotation, Revision } from "@/components/Editor/types";
import { WritingStyle } from "@/pages/Landing";
import { v4 as uuidv4 } from 'uuid';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = import.meta.env.VITE_API_URL;

interface AIResponse {
  revisedText: string;
  explanation: string;
  considerAnnotations: boolean;
}

const getStylePrompt = (style: WritingStyle): string => {
  const styleGuides = {
    creative: "Be imaginative and expressive. Use vivid language, metaphors, and engaging narrative techniques while maintaining clarity.",
    formal: "Maintain a professional and polished tone. Use clear, precise language and formal vocabulary appropriate for business or official contexts.",
    academic: "Follow academic writing conventions. Use scholarly language, maintain objectivity, and ensure proper structure and argumentation.",
    casual: "Adopt a conversational and relaxed tone while maintaining clarity and coherence. Use natural language and accessible vocabulary.",
    technical: "Focus on precision and clarity. Use technical terminology appropriately, maintain a logical structure, and prioritize accuracy."
  };

  return styleGuides[style] || styleGuides.formal;
};

const generatePrompt = (
  fullText: string, 
  selectedText: string, 
  style: WritingStyle = 'formal',
  annotations: Annotation[] = []
) => {
  const relevantAnnotations = annotations.filter(a => selectedText.includes(a.text));
  
  return [
    {
      role: "system",
      content: `You are an expert writing assistant. Your task is to improve the selected text while maintaining consistency with the overall document context. ${getStylePrompt(style)}

Focus on:
1. Maintaining consistency with the document's context
2. Appropriate tone and style
3. Clarity and coherence
4. Grammar and mechanics
5. Impact and engagement

Format your response exactly like this:
Revised Text: "[Your revised version here]"
Explanation of changes: [Your detailed explanation here]
Consider Annotations: [true/false] - Indicate if you think the annotations should be considered for this revision`
    },
    {
      role: "user",
      content: `Here's the full document for context:
"""
${fullText}
"""

Please improve this specific text: "${selectedText}"

${relevantAnnotations.length > 0 ? `
There are ${relevantAnnotations.length} annotation(s) related to this text:
${relevantAnnotations.map(a => `- "${a.text}": ${a.comment}`).join('\n')}
` : ''}`
    }
  ];
};

const parseAIResponse = (response: any): AIResponse => {
  try {
    const content = response.choices[0].message.content;
    
    // Extract the revised text
    const revisedTextMatch = content.match(/Revised Text: "(.*?)"/);
    const revisedText = revisedTextMatch ? revisedTextMatch[1].trim() : "";

    // Extract the explanation
    const explanationMatch = content.match(/Explanation of changes: (.*?)(?=Consider Annotations:|$)/s);
    const explanation = explanationMatch ? explanationMatch[1].trim() : "No explanation provided";

    // Extract the annotations consideration
    const considerAnnotationsMatch = content.match(/Consider Annotations: (true|false)/);
    const considerAnnotations = considerAnnotationsMatch ? considerAnnotationsMatch[1] === 'true' : false;

    if (!revisedText) {
      throw new Error("Could not find revised text in response");
    }

    return {
      revisedText,
      explanation,
      considerAnnotations
    };
  } catch (error) {
    console.error("Error parsing AI response:", error, response);
    throw new Error("Failed to parse AI response");
  }
};

export const generateRevision = async (
  fullText: string,
  selectedText: string,
  style: WritingStyle = 'formal',
  annotations: Annotation[] = []
): Promise<Revision & { considerAnnotations: boolean }> => {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: generatePrompt(fullText, selectedText, style, annotations),
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const { revisedText, explanation, considerAnnotations } = parseAIResponse(data);

    return {
      id: uuidv4(),
      timestamp: new Date(),
      originalText: selectedText,
      revisedText,
      explanation,
      considerAnnotations
    };
  } catch (error) {
    console.error("AI revision error:", error);
    throw error;
  }
};
