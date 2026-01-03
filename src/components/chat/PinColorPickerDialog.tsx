import { useState } from "react";
import { Pin, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { pinColors, PinColor } from "./PinColorSelector";

interface PinColorPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectColor: (color: PinColor) => void;
  currentColor?: PinColor;
}

export function PinColorPickerDialog({
  open,
  onOpenChange,
  onSelectColor,
  currentColor = "primary",
}: PinColorPickerDialogProps) {
  const [selectedColor, setSelectedColor] = useState<PinColor>(currentColor);

  const handleConfirm = () => {
    onSelectColor(selectedColor);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pin className="h-4 w-4" />
            Choose Pin Color
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-3 py-4">
          {pinColors.map((color) => (
            <button
              key={color.id}
              onClick={() => setSelectedColor(color.id)}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                selectedColor === color.id
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:bg-secondary"
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${color.bg} flex items-center justify-center`}>
                <Pin className={`w-4 h-4 ${color.text} ${color.fill}`} />
              </div>
              <span className="text-xs font-medium">{color.name}</span>
              {selectedColor === color.id && (
                <Check className="absolute top-1 right-1 h-3 w-3 text-primary" />
              )}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Pin
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
