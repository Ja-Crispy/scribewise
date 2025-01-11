import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { History, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Revision } from "./types";
import { formatDistanceToNow } from "date-fns";
import * as Diff from 'diff';
import { useState } from "react";

interface RevisionHistoryProps {
  revisions: Revision[];
  onClose: () => void;
  onApplyRevision: (revision: Revision) => void;
}

export const RevisionHistory = ({ revisions, onClose, onApplyRevision }: RevisionHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRevisions = revisions.filter((revision) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      revision.originalText.toLowerCase().includes(searchLower) ||
      revision.revisedText.toLowerCase().includes(searchLower) ||
      revision.explanation.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card className="p-4 bg-card h-[calc(100vh-16rem)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold flex items-center gap-2 text-foreground">
          <History className="h-4 w-4" />
          Revision History
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search revisions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-background text-foreground"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-4">
          {filteredRevisions.map((revision) => (
            <Card
              key={revision.id}
              className="p-4 bg-background"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatDistanceToNow(new Date(revision.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onApplyRevision(revision)}
                  className="ml-2"
                >
                  Apply
                </Button>
              </div>

              <div className="text-sm space-y-4">
                <div className="space-y-2">
                  <div className="bg-background/50 p-2 rounded-md border">
                    <p className="text-muted-foreground line-through">
                      {revision.originalText}
                    </p>
                  </div>
                  <div className="bg-background/50 p-2 rounded-md border">
                    <p className="text-foreground">
                      {revision.revisedText}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-foreground">
                  {revision.explanation}
                </p>
              </div>
            </Card>
          ))}
          {filteredRevisions.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No revisions found.
            </p>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
