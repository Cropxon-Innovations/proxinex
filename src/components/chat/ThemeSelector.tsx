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
  variables: Record<string, string>;
}

const themes: ThemeOption[] = [
  { 
    id: "default", 
    name: "Obsidian", 
    primary: "#00e5ff",
    variables: {
      "--primary": "186 100% 50%",
      "--primary-foreground": "222 47% 6%",
      "--accent": "186 70% 40%",
      "--background": "222 47% 6%",
      "--card": "222 47% 9%",
      "--ring": "186 100% 50%",
    }
  },
  { 
    id: "midnight", 
    name: "Midnight", 
    primary: "#818cf8",
    variables: {
      "--primary": "239 84% 67%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "239 60% 50%",
      "--background": "240 20% 6%",
      "--card": "240 20% 9%",
      "--ring": "239 84% 67%",
    }
  },
  { 
    id: "ocean", 
    name: "Ocean", 
    primary: "#22d3ee",
    variables: {
      "--primary": "188 94% 53%",
      "--primary-foreground": "222 47% 6%",
      "--accent": "188 70% 40%",
      "--background": "210 40% 8%",
      "--card": "210 40% 11%",
      "--ring": "188 94% 53%",
    }
  },
  { 
    id: "forest", 
    name: "Forest", 
    primary: "#4ade80",
    variables: {
      "--primary": "142 71% 60%",
      "--primary-foreground": "222 47% 6%",
      "--accent": "142 50% 45%",
      "--background": "150 20% 6%",
      "--card": "150 20% 9%",
      "--ring": "142 71% 60%",
    }
  },
  { 
    id: "sunset", 
    name: "Sunset", 
    primary: "#fb923c",
    variables: {
      "--primary": "27 96% 61%",
      "--primary-foreground": "222 47% 6%",
      "--accent": "27 80% 50%",
      "--background": "15 20% 6%",
      "--card": "15 20% 9%",
      "--ring": "27 96% 61%",
    }
  },
  { 
    id: "lavender", 
    name: "Lavender", 
    primary: "#c084fc",
    variables: {
      "--primary": "270 91% 75%",
      "--primary-foreground": "222 47% 6%",
      "--accent": "270 60% 60%",
      "--background": "270 20% 6%",
      "--card": "270 20% 9%",
      "--ring": "270 91% 75%",
    }
  },
];

interface ThemeSelectorProps {
  onThemeChange?: (theme: Theme) => void;
  onColorModeChange?: (mode: ColorMode) => void;
}

export const ThemeSelector = ({ onThemeChange, onColorModeChange }: ThemeSelectorProps) => {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem("proxinex-theme") as Theme) || "default";
    }
    return "default";
  });
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem("proxinex-color-mode") as ColorMode) || "dark";
    }
    return "dark";
  });

  // Apply theme on mount and when it changes
  useEffect(() => {
    const theme = themes.find(t => t.id === selectedTheme);
    if (theme) {
      const root = document.documentElement;
      Object.entries(theme.variables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
      root.setAttribute("data-theme", selectedTheme);
      localStorage.setItem("proxinex-theme", selectedTheme);
    }
  }, [selectedTheme]);

  // Apply color mode
  useEffect(() => {
    const root = document.documentElement;
    if (colorMode === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
    } else {
      root.classList.toggle("dark", colorMode === "dark");
    }
    localStorage.setItem("proxinex-color-mode", colorMode);
  }, [colorMode]);

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    onThemeChange?.(theme);
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
                  className="w-8 h-8 rounded-full border-2 mb-1"
                  style={{ 
                    background: theme.primary,
                    borderColor: theme.primary 
                  }}
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
