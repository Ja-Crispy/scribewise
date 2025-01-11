import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface FloatingAnnotationFormProps {
  onClose: () => void;
  annotationInput: string;
  onAnnotationChange: (value: string) => void;
  onSubmit: () => void;
}

export const FloatingAnnotationForm = ({
  onClose,
  annotationInput,
  onAnnotationChange,
  onSubmit,
}: FloatingAnnotationFormProps) => {
  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:right-8 animate-fade-in z-50">
      <Card className="p-4 w-full md:w-80 shadow-lg bg-card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-foreground">Add Annotation</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Textarea
          className="w-full mb-3 h-24 bg-background text-foreground"
          value={annotationInput}
          onChange={(e) => onAnnotationChange(e.target.value)}
          placeholder="Write your annotation here..."
        />
        <Button onClick={onSubmit} className="w-full">
          Save Annotation
        </Button>
      </Card>
    </div>
  );
};