import { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Heart,
  Copy,
  Share2,
  Check,
  MessageSquare,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface FeedbackActionsProps {
  messageId?: string;
  content: string;
  onFeedback?: (type: "up" | "down" | "love", reason?: string) => void;
}

const feedbackReasons = [
  "Inaccurate information",
  "Not helpful",
  "Too long/verbose",
  "Too short/lacking detail",
  "Wrong format",
  "Outdated information",
  "Misunderstood my question",
  "Other",
];

export const FeedbackActions = ({ messageId, content, onFeedback }: FeedbackActionsProps) => {
  const [feedback, setFeedback] = useState<"up" | "down" | "love" | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Proxinex Response",
          text: content,
        });
      } catch (err) {
        // User cancelled or share failed
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleFeedback = (type: "up" | "down" | "love") => {
    if (type === "down") {
      setShowFeedbackDialog(true);
      return;
    }

    setFeedback(type);
    onFeedback?.(type);
    
    const messages = {
      up: "Thanks for the feedback!",
      love: "Glad you loved it!",
    };
    
    toast({ title: messages[type] });
  };

  const submitNegativeFeedback = () => {
    setFeedback("down");
    onFeedback?.("down", selectedReason || additionalFeedback);
    setShowFeedbackDialog(false);
    toast({
      title: "Feedback submitted",
      description: "We'll use this to improve Proxinex",
    });
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Thumbs Up */}
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${feedback === "up" ? "text-success bg-success/10" : ""}`}
          onClick={() => handleFeedback("up")}
        >
          <ThumbsUp className={`h-3.5 w-3.5 ${feedback === "up" ? "fill-current" : ""}`} />
        </Button>

        {/* Thumbs Down */}
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${feedback === "down" ? "text-destructive bg-destructive/10" : ""}`}
          onClick={() => handleFeedback("down")}
        >
          <ThumbsDown className={`h-3.5 w-3.5 ${feedback === "down" ? "fill-current" : ""}`} />
        </Button>

        {/* Love */}
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${feedback === "love" ? "text-pink-500 bg-pink-500/10" : ""}`}
          onClick={() => handleFeedback("love")}
        >
          <Heart className={`h-3.5 w-3.5 ${feedback === "love" ? "fill-current" : ""}`} />
        </Button>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Copy */}
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${copied ? "text-success" : ""}`}
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>

        {/* Share */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleShare}
        >
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Negative Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Help us improve
            </DialogTitle>
            <DialogDescription>
              What went wrong with this response?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Reason Options */}
            <div className="grid grid-cols-2 gap-2">
              {feedbackReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                    selectedReason === reason
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border hover:border-muted-foreground text-muted-foreground"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {/* Additional Feedback */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Additional details (optional)
              </label>
              <Textarea
                value={additionalFeedback}
                onChange={(e) => setAdditionalFeedback(e.target.value)}
                placeholder="Tell us more about what went wrong..."
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFeedbackDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={submitNegativeFeedback}>
                Submit Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
