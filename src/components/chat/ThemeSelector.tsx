import { useState, useEffect } from "react";
import { Palette, Check, Moon, Sun, Monitor } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type Theme = "default" | "midnight" | "ocean" | "forest" | "sunset" | "lavender";
type ColorMode = "dark" | "light" | "system";

interface ThemeOption {
  id: Theme;
  name: string;
  primary: string;
  background: string;
  preview: string;
}

const themes: ThemeOption[] = [
  { id: "default", name: "Obsidian", primary: "#00e5ff", background: "#0a0f1a", preview: "bg-[#0a0f1a]" },
  { id: "midnight", name: "Midnight", primary: "#818cf8", background: "#0f0f23", preview: "bg-[#0f0f23]" },
  { id: "ocean", name: "Ocean", primary: "#22d3ee", background: "#0c1929", preview: "bg-[#0c1929]" },
  { id: "forest", name: "Forest", primary: "#4ade80", background: "#0f1a15", preview: "bg-[#0f1a15]" },
  { id: "sunset", name: "Sunset", primary: "#fb923c", background: "#1a0f0f", preview: "bg-[#1a0f0f]" },
  { id: "lavender", name: "Lavender", primary: "#c084fc", background: "#150f1a", preview: "bg-[#150f1a]" },
];

interface ThemeSelectorProps {
  onThemeChange?: (theme: Theme) => void;
  onColorModeChange?: (mode: ColorMode) => void;
}

export const ThemeSelector = ({ onThemeChange, onColorModeChange }: ThemeSelectorProps) => {
  const [selectedTheme, setSelectedTheme] = useState<Theme>("default");
  const [colorMode, setColorMode] = useState<ColorMode>("dark");

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    onThemeChange?.(theme);
    // In a real app, you'd apply CSS variables here
    document.documentElement.setAttribute("data-theme", theme);
  };

  const handleColorModeChange = (mode: ColorMode) => {
    setColorMode(mode);
    onColorModeChange?.(mode);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">Theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        {/* Color Mode */}
        <div className="mb-4">
          <div className="text-xs font-medium text-muted-foreground mb-2">Appearance</div>
          <div className="flex gap-1">
            <Button
              variant={colorMode === "dark" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => handleColorModeChange("dark")}
            >
              <Moon className="h-4 w-4 mr-1" />
              Dark
            </Button>
            <Button
              variant={colorMode === "light" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => handleColorModeChange("light")}
            >
              <Sun className="h-4 w-4 mr-1" />
              Light
            </Button>
            <Button
              variant={colorMode === "system" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => handleColorModeChange("system")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Theme Colors */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">Theme</div>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`relative flex flex-col items-center p-2 rounded-lg border transition-all ${
                  selectedTheme === theme.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full ${theme.preview} border-2 mb-1`}
                  style={{ borderColor: theme.primary }}
                />
                <span className="text-[10px] text-muted-foreground">{theme.name}</span>
                {selectedTheme === theme.id && (
                  <Check className="absolute top-1 right-1 h-3 w-3 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
