import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowRight, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PromptEnhanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  original: string;
  enhanced: string;
  onAccept: () => void;
  onRevert: () => void;
}

export const PromptEnhanceDialog = ({
  open,
  onOpenChange,
  original,
  enhanced,
  onAccept,
  onRevert,
}: PromptEnhanceDialogProps) => {
  // Find differences between original and enhanced for highlighting
  const highlightDifferences = (text: string, isEnhanced: boolean) => {
    return text;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Prompt Enhanced
          </DialogTitle>
          <DialogDescription>
            Your prompt has been improved with better grammar and clarity. Review the changes below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 my-4">
          {/* Original */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-muted-foreground">
                Original
              </Badge>
            </div>
            <ScrollArea className="h-40 rounded-lg border border-border bg-secondary/30 p-3">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {original}
              </p>
            </ScrollArea>
          </div>

          {/* Arrow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 hidden">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Enhanced */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Enhanced
              </Badge>
            </div>
            <ScrollArea className="h-40 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {enhanced}
              </p>
            </ScrollArea>
          </div>
        </div>

        {/* Diff Summary */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3">
          <span>
            <strong className="text-foreground">{original.split(' ').length}</strong> words → <strong className="text-primary">{enhanced.split(' ').length}</strong> words
          </span>
          <span className="text-border">|</span>
          <span>
            <strong className="text-foreground">{original.length}</strong> chars → <strong className="text-primary">{enhanced.length}</strong> chars
          </span>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onRevert}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Keep Original
          </Button>
          <Button
            onClick={onAccept}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Use Enhanced
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
