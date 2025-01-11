import React from 'react';
import { Button } from "@/components/ui/button";
import { History, Undo, Redo, Wand2, Copy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EditorToolbarProps {
  onHistoryClick: () => void;
  onRevisionRequest: () => void;
  isRequestingRevision: boolean;
  hasSelectedText: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onCopy: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onHistoryClick,
  onRevisionRequest,
  isRequestingRevision,
  hasSelectedText,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onCopy,
}) => {
  return (
    <TooltipProvider>
      <div className="mb-4 flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo (Ctrl+Z)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo (Ctrl+Y)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onCopy}
              aria-label="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy to clipboard</p>
          </TooltipContent>
        </Tooltip>

        <div className="flex-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onHistoryClick}
              aria-label="View revision history"
            >
              <History className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View revision history</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onRevisionRequest}
              disabled={isRequestingRevision || !hasSelectedText}
              aria-label="Request AI revision"
            >
              {isRequestingRevision ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Revising...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  <span>Revise</span>
                </div>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Request AI revision for selected text</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};