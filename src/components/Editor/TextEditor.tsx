import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { RevisionHistory } from "./RevisionHistory";
import { EditorToolbar } from "./EditorToolbar";
import { AnnotationPanel } from "./AnnotationPanel";
import { FloatingAnnotationForm } from "./FloatingAnnotationForm";
import { generateRevision } from "@/lib/ai-service";
import { Annotation, Revision } from "./types";
import { v4 as uuidv4 } from 'uuid';
import { useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WritingStyle } from "@/pages/Landing";
import { ThemeToggle } from "@/components/theme-toggle";
import mammoth from "mammoth";
import * as pdfjs from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';

// Initialize PDF.js worker
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface TextState {
  content: string;
  timestamp: Date;
}

const sampleText = `Ladies and gentlemen, today we celebrate the extraordinary career of Andy Murray. Born in Glasgow in 1987, Murray's journey from a young boy in Dunblane to a tennis legend is truly remarkable. His resilience, exemplified by his comeback from hip surgery in 2019, is awe-inspiring. Murray's achievements span three Grand Slam titles, two Olympic gold medals, and the coveted world number one ranking. But beyond the statistics, it's his fighting spirit and dedication to the sport that define his legacy. Andy Murray has not just played tennis; he has shown what it means to be a champion, both on and off the court.`;

export const TextEditor = () => {
  const location = useLocation();
  const writingStyle = (location.state?.writingStyle || 'formal') as WritingStyle;
  
  const [selectedText, setSelectedText] = useState("");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [annotationInput, setAnnotationInput] = useState("");
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const { toast } = useToast();

  // Undo/Redo state with proper initialization
  const [textStates, setTextStates] = useState<TextState[]>([
    { content: sampleText, timestamp: new Date() }
  ]);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);

  // Improved addTextState function with proper state management
  const addTextState = useCallback((newContent: string) => {
    setTextStates(prev => {
      // Remove any states after the current index
      const newStates = prev.slice(0, currentStateIndex + 1);
      // Add the new state
      return [...newStates, { content: newContent, timestamp: new Date() }];
    });
    setCurrentStateIndex(prev => prev + 1);
  }, [currentStateIndex]);

  // Update editor content when state changes
  useEffect(() => {
    if (editorRef.current && textStates[currentStateIndex]) {
      const content = textStates[currentStateIndex].content;
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [currentStateIndex, textStates]);

  // Update word and character count
  useEffect(() => {
    if (textStates[currentStateIndex]) {
      const text = textStates[currentStateIndex].content.replace(/<[^>]*>/g, '');
      setCharCount(text.length);
      setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
    }
  }, [textStates, currentStateIndex]);

  // Memoized handlers
  const handleCopy = useCallback(() => {
    const text = textStates[currentStateIndex].content.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied successfully.",
      });
    }).catch(() => {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      });
    });
  }, [textStates, currentStateIndex, toast]);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setSelectedText(selection.toString());
      setShowAnnotationForm(true);
    }
  }, []);

  const handleAnnotationSubmit = useCallback(() => {
    if (selectedText && annotationInput) {
      const newContent = textStates[currentStateIndex].content.replace(
        selectedText,
        `<mark class="bg-blue-200 dark:bg-blue-800">${selectedText}</mark>`
      );
      addTextState(newContent);
      
      setAnnotations([...annotations, { text: selectedText, comment: annotationInput }]);
      setShowAnnotationForm(false);
      setAnnotationInput("");
      setSelectedText("");
      toast({
        title: "Annotation added",
        description: "Your annotation has been saved successfully.",
      });
    }
  }, [selectedText, annotationInput, textStates, currentStateIndex, annotations, toast, addTextState]);

  const handleUndo = useCallback(() => {
    if (currentStateIndex > 0) {
      setCurrentStateIndex(prev => prev - 1);
      toast({
        title: "Undo",
        description: "Previous change has been undone.",
      });
    }
  }, [currentStateIndex, toast]);

  const handleRedo = useCallback(() => {
    if (currentStateIndex < textStates.length - 1) {
      setCurrentStateIndex(prev => prev + 1);
      toast({
        title: "Redo",
        description: "Change has been reapplied.",
      });
    }
  }, [currentStateIndex, textStates.length, toast]);

  // Get surrounding context for better AI revisions
  const getTextWithContext = (selectedText: string): string => {
    const content = textStates[currentStateIndex].content;
    const selectionStart = content.indexOf(selectedText);
    if (selectionStart === -1) return selectedText;

    // Get the word after the selection
    const afterText = content.slice(selectionStart + selectedText.length).match(/^\s*\w+/)?.[0] || '';
    
    return selectedText + afterText;
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key === 'z') {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // File handling
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let content = '';
      
      if (file.type === 'text/plain' || file.name.endsWith('.md')) {
        content = await file.text();
      } else if (file.type === 'application/pdf') {
        // Show loading toast
        toast({
          title: "Loading PDF",
          description: "Please wait while we extract text from your PDF...",
        });

        // Load the PDF file
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        
        // Get all pages
        const numPages = pdf.numPages;
        const textContent = [];
        
        // Extract text from each page
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            .map((item: any) => item.str)
            .join(' ')
            .replace(/\s+/g, ' '); // Clean up excessive whitespace
          textContent.push(pageText);
        }
        
        content = textContent.join('\n\n');
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        content = result.value;
      } else {
        content = await file.text();
        content = content.replace(/[^\x20-\x7E\n]/g, '');
      }

      addTextState(content);
      toast({
        title: "Document loaded",
        description: `Successfully loaded ${file.name}`,
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Error",
        description: "Failed to load the document. Please try a different file format.",
        variant: "destructive",
      });
    }
  };

  const handleRequestRevision = async () => {
    if (selectedText) {
      setIsRequestingRevision(true);
      try {
        const revision = await generateRevision(
          textStates[currentStateIndex].content,
          selectedText,
          writingStyle,
          annotations
        );
        
        // Create new content with highlighted revised text and remove annotation highlights
        let newContent = textStates[currentStateIndex].content;
        annotations.forEach(annotation => {
          if (selectedText.includes(annotation.text)) {
            newContent = newContent.replace(
              `<mark class="bg-blue-200 dark:bg-blue-800">${annotation.text}</mark>`,
              annotation.text
            );
          }
        });
        newContent = newContent.replace(
          selectedText,
          `<mark class="bg-yellow-200 dark:bg-yellow-800">${revision.revisedText}</mark>`
        );
        
        // Reset annotations that were used for this revision
        setAnnotations(annotations.filter(annotation => 
          !selectedText.includes(annotation.text)
        ));
        
        setRevisions([revision, ...revisions]);
        addTextState(newContent);
        setSelectedText("");
        setShowRevisionHistory(true);
        
        // Remove highlight after 15 seconds
        setTimeout(() => {
          setTextStates(prev => {
            const current = [...prev];
            current[current.length - 1] = {
              content: current[current.length - 1].content.replace(
                `<mark class="bg-yellow-200 dark:bg-yellow-800">${revision.revisedText}</mark>`,
                revision.revisedText
              ),
              timestamp: current[current.length - 1].timestamp
            };
            return current;
          });
          setCurrentStateIndex(prev => prev);
        }, 15000);
        
        toast({
          title: "Revision generated",
          description: "The text has been revised successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate revision. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsRequestingRevision(false);
      }
    }
  };

  const handleApplyRevision = (revision: Revision) => {
    const currentContent = textStates[currentStateIndex].content;
    const newContent = currentContent.replace(revision.originalText, revision.revisedText);
    addTextState(newContent);
    
    toast({
      title: "Revision applied",
      description: "The selected revision has been applied to your text.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container flex h-14 items-center px-4">
          <h1 className="text-xl font-semibold">ScribeWise</h1>
          <div className="flex-1" />
          <span className="text-sm text-muted-foreground mr-4 capitalize">
            {writingStyle} Style
          </span>
          <ThemeToggle />
        </div>
      </header>
      <div className="p-4 md:p-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 flex items-center gap-4">
            <Input
              type="file"
              accept=".txt,.md,.docx,.pdf"
              onChange={handleFileUpload}
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground capitalize">Style: {writingStyle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Main Editor */}
            <div className="md:col-span-2">
              <Card className="p-4 md:p-6 bg-card">
                <EditorToolbar
                  onHistoryClick={() => setShowRevisionHistory(!showRevisionHistory)}
                  onRevisionRequest={handleRequestRevision}
                  isRequestingRevision={isRequestingRevision}
                  hasSelectedText={!!selectedText}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={currentStateIndex > 0}
                  canRedo={currentStateIndex < textStates.length - 1}
                  onCopy={handleCopy}
                />
                <div
                  ref={editorRef}
                  className="prose prose-sm max-w-none dark:prose-invert"
                  contentEditable
                  role="textbox"
                  aria-label="Text editor content"
                  aria-multiline="true"
                  onInput={(e) => {
                    const content = e.currentTarget.innerHTML;
                    if (content !== textStates[currentStateIndex].content) {
                      addTextState(content);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleUndo();
                    } else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleRedo();
                    }
                  }}
                  onMouseUp={handleTextSelection}
                />
                <div className="mt-2 text-sm text-muted-foreground flex justify-between items-center">
                  <div>
                    <span>{wordCount} words</span>
                    <span className="mx-2">•</span>
                    <span>{charCount} characters</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              {showRevisionHistory ? (
                <RevisionHistory
                  revisions={revisions}
                  onClose={() => setShowRevisionHistory(false)}
                  onApplyRevision={handleApplyRevision}
                />
              ) : (
                <AnnotationPanel annotations={annotations} />
              )}
            </div>
          </div>
        </div>

        {/* Floating Annotation Form */}
        {showAnnotationForm && (
          <FloatingAnnotationForm
            onClose={() => setShowAnnotationForm(false)}
            annotationInput={annotationInput}
            onAnnotationChange={setAnnotationInput}
            onSubmit={handleAnnotationSubmit}
          />
        )}
      </div>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        Made with ❤️ by Vaishnav
      </footer>
    </div>
  );
};