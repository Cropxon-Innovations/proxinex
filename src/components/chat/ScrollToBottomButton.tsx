import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScrollToBottomButtonProps {
  visible: boolean;
  onClick: () => void;
  className?: string;
}

export const ScrollToBottomButton = ({
  visible,
  onClick,
  className,
}: ScrollToBottomButtonProps) => {
  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={onClick}
      className={cn(
        "fixed z-40 h-10 w-10 rounded-full shadow-lg border border-border transition-all duration-300",
        "bg-background/95 backdrop-blur-sm hover:bg-secondary",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none",
        className
      )}
    >
      <ArrowDown className="h-4 w-4" />
      <span className="sr-only">Scroll to bottom</span>
    </Button>
  );
};
