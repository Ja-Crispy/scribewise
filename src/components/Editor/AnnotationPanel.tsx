import { Card } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { Annotation } from "./types";

interface AnnotationPanelProps {
  annotations: Annotation[];
}

export const AnnotationPanel = ({ annotations }: AnnotationPanelProps) => {
  return (
    <Card className="p-4 bg-card">
      <h2 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
        <Pencil className="h-4 w-4" />
        Annotations
      </h2>
      <div className="space-y-4">
        {annotations.map((annotation, index) => (
          <Card key={index} className="p-3 bg-background border">
            <p className="text-sm font-medium text-foreground mb-2">
              "{annotation.text}"
            </p>
            <p className="text-sm text-muted-foreground">{annotation.comment}</p>
          </Card>
        ))}
        {annotations.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No annotations yet. Select text to add one.
          </p>
        )}
      </div>
    </Card>
  );
};