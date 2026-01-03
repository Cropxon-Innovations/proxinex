import { useState, useEffect } from "react";
import { Pin, Check, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export type PinColor = "primary" | "red" | "orange" | "yellow" | "green" | "blue" | "purple";

export interface PinColorConfig {
  id: PinColor;
  name: string;
  bg: string;
  text: string;
  fill: string;
}

export const pinColors: PinColorConfig[] = [
  {
    id: "primary",
    name: "Default",
    bg: "bg-primary/20",
    text: "text-primary",
    fill: "fill-primary",
  },
  {
    id: "red",
    name: "Red",
    bg: "bg-red-500/20",
    text: "text-red-500",
    fill: "fill-red-500",
  },
  {
    id: "orange",
    name: "Orange",
    bg: "bg-orange-500/20",
    text: "text-orange-500",
    fill: "fill-orange-500",
  },
  {
    id: "yellow",
    name: "Yellow",
    bg: "bg-yellow-500/20",
    text: "text-yellow-500",
    fill: "fill-yellow-500",
  },
  {
    id: "green",
    name: "Green",
    bg: "bg-green-500/20",
    text: "text-green-500",
    fill: "fill-green-500",
  },
  {
    id: "blue",
    name: "Blue",
    bg: "bg-blue-500/20",
    text: "text-blue-500",
    fill: "fill-blue-500",
  },
  {
    id: "purple",
    name: "Purple",
    bg: "bg-purple-500/20",
    text: "text-purple-500",
    fill: "fill-purple-500",
  },
];

const STORAGE_KEY = "proxinex-pin-color";

export function usePinColor() {
  const [color, setColor] = useState<PinColor>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(STORAGE_KEY) as PinColor) || "primary";
    }
    return "primary";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, color);
  }, [color]);

  const colorConfig = pinColors.find((c) => c.id === color) || pinColors[0];

  return { color, setColor, colorConfig };
}

export function PinColorSelector() {
  const { color, setColor, colorConfig } = usePinColor();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Pin className={`h-4 w-4 ${colorConfig.text}`} />
          <span className="text-xs">{colorConfig.name}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 p-2">
        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
          Pin Color
        </div>
        {pinColors.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setColor(c.id);
              setOpen(false);
            }}
            className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors ${
              color === c.id ? "bg-secondary" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full ${c.bg}`}
              >
                <Pin className={`w-3 h-3 m-0.5 ${c.text}`} />
              </div>
              <span className="text-sm">{c.name}</span>
            </div>
            {color === c.id && <Check className="h-4 w-4 text-primary" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
