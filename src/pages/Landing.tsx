import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export type WritingStyle = 'creative' | 'formal' | 'academic' | 'casual' | 'technical';

const writingStyles: { id: WritingStyle; title: string; description: string }[] = [
  {
    id: 'creative',
    title: 'Creative Writing',
    description: 'Perfect for storytelling, poetry, and imaginative content',
  },
  {
    id: 'formal',
    title: 'Formal Writing',
    description: 'Suitable for business communications and official documents',
  },
  {
    id: 'academic',
    title: 'Academic Writing',
    description: 'Ideal for research papers, essays, and scholarly work',
  },
  {
    id: 'casual',
    title: 'Casual Writing',
    description: 'Great for blogs, social media, and informal content',
  },
  {
    id: 'technical',
    title: 'Technical Writing',
    description: 'Best for documentation, guides, and technical content',
  },
];

export const Landing = () => {
  const navigate = useNavigate();

  const handleStyleSelect = (style: WritingStyle) => {
    navigate('/editor', { state: { writingStyle: style } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b dark:border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">ScribeWise</h1>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Welcome to ScribeWise</h2>
            <p className="text-lg text-muted-foreground mb-2">Your AI-powered writing assistant</p>
            <p className="text-muted-foreground">
              Select a writing style that best matches your needs. Our AI will tailor its suggestions accordingly.
            </p>
          </div>

          <div className="grid gap-4">
            {writingStyles.map((style) => (
              <Card
                key={style.id}
                className="p-6 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleStyleSelect(style.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{style.title}</h3>
                    <p className="text-muted-foreground">{style.description}</p>
                  </div>
                  <Button variant="ghost">Select</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
