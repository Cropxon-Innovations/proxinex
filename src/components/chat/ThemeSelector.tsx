import { useState, useEffect, useRef, useCallback } from "react";
import { Palette, Check, Moon, Sun, Monitor } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type Theme = "default" | "midnight" | "ocean" | "forest" | "sunset" | "lavender" | "minimal";
type ColorMode = "dark" | "light" | "system";

interface ThemeOption {
  id: Theme;
  name: string;
  primary: string;
  darkVariables: Record<string, string>;
  lightVariables: Record<string, string>;
}

const themes: ThemeOption[] = [
  { 
    id: "minimal", 
    name: "Minimal", 
    primary: "#888888",
    darkVariables: {
      "--primary": "0 0% 100%",
      "--primary-foreground": "0 0% 0%",
      "--accent": "0 0% 85%",
      "--background": "0 0% 0%",
      "--foreground": "0 0% 100%",
      "--card": "0 0% 5%",
      "--card-foreground": "0 0% 100%",
      "--popover": "0 0% 8%",
      "--popover-foreground": "0 0% 100%",
      "--secondary": "0 0% 12%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "0 0% 15%",
      "--muted-foreground": "0 0% 60%",
      "--border": "0 0% 20%",
      "--input": "0 0% 12%",
      "--ring": "0 0% 100%",
    },
    lightVariables: {
      "--primary": "0 0% 0%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "0 0% 15%",
      "--background": "0 0% 100%",
      "--foreground": "0 0% 0%",
      "--card": "0 0% 98%",
      "--card-foreground": "0 0% 0%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "0 0% 0%",
      "--secondary": "0 0% 96%",
      "--secondary-foreground": "0 0% 0%",
      "--muted": "0 0% 96%",
      "--muted-foreground": "0 0% 45%",
      "--border": "0 0% 90%",
      "--input": "0 0% 90%",
      "--ring": "0 0% 0%",
    }
  },
  { 
    id: "default", 
    name: "Obsidian", 
    primary: "#00e5ff",
    darkVariables: {
      "--primary": "186 100% 50%",
      "--primary-foreground": "222 47% 6%",
      "--accent": "186 70% 40%",
      "--background": "222 47% 6%",
      "--foreground": "210 40% 96%",
      "--card": "222 47% 9%",
      "--card-foreground": "210 40% 96%",
      "--popover": "222 47% 11%",
      "--popover-foreground": "210 40% 96%",
      "--secondary": "222 47% 14%",
      "--secondary-foreground": "210 40% 96%",
      "--muted": "222 30% 18%",
      "--muted-foreground": "215 20% 55%",
      "--border": "222 30% 18%",
      "--input": "222 30% 14%",
      "--ring": "186 100% 50%",
    },
    lightVariables: {
      "--primary": "186 100% 40%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "186 70% 40%",
      "--background": "0 0% 100%",
      "--foreground": "222 47% 11%",
      "--card": "0 0% 98%",
      "--card-foreground": "222 47% 11%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "222 47% 11%",
      "--secondary": "220 14% 96%",
      "--secondary-foreground": "222 47% 11%",
      "--muted": "220 14% 96%",
      "--muted-foreground": "220 9% 46%",
      "--border": "220 13% 91%",
      "--input": "220 13% 91%",
      "--ring": "186 100% 40%",
    }
  },
  { 
    id: "midnight", 
    name: "Midnight", 
    primary: "#818cf8",
    darkVariables: {
      "--primary": "239 84% 67%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "239 60% 50%",
      "--background": "240 20% 6%",
      "--foreground": "210 40% 96%",
      "--card": "240 20% 9%",
      "--card-foreground": "210 40% 96%",
      "--popover": "240 20% 11%",
      "--popover-foreground": "210 40% 96%",
      "--secondary": "240 20% 14%",
      "--secondary-foreground": "210 40% 96%",
      "--muted": "240 20% 18%",
      "--muted-foreground": "215 20% 55%",
      "--border": "240 20% 18%",
      "--input": "240 20% 14%",
      "--ring": "239 84% 67%",
    },
    lightVariables: {
      "--primary": "239 84% 60%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "239 60% 50%",
      "--background": "0 0% 100%",
      "--foreground": "240 20% 11%",
      "--card": "240 10% 98%",
      "--card-foreground": "240 20% 11%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "240 20% 11%",
      "--secondary": "240 10% 96%",
      "--secondary-foreground": "240 20% 11%",
      "--muted": "240 10% 96%",
      "--muted-foreground": "240 10% 46%",
      "--border": "240 10% 91%",
      "--input": "240 10% 91%",
      "--ring": "239 84% 60%",
    }
  },
  { 
    id: "ocean", 
    name: "Ocean", 
    primary: "#22d3ee",
    darkVariables: {
      "--primary": "188 94% 53%",
      "--primary-foreground": "222 47% 6%",
      "--accent": "188 70% 40%",
      "--background": "210 40% 8%",
      "--foreground": "210 40% 96%",
      "--card": "210 40% 11%",
      "--card-foreground": "210 40% 96%",
      "--popover": "210 40% 13%",
      "--popover-foreground": "210 40% 96%",
      "--secondary": "210 40% 16%",
      "--secondary-foreground": "210 40% 96%",
      "--muted": "210 30% 20%",
      "--muted-foreground": "210 20% 55%",
      "--border": "210 30% 20%",
      "--input": "210 40% 16%",
      "--ring": "188 94% 53%",
    },
    lightVariables: {
      "--primary": "188 94% 43%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "188 70% 40%",
      "--background": "0 0% 100%",
      "--foreground": "210 40% 11%",
      "--card": "195 10% 98%",
      "--card-foreground": "210 40% 11%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "210 40% 11%",
      "--secondary": "195 20% 96%",
      "--secondary-foreground": "210 40% 11%",
      "--muted": "195 20% 96%",
      "--muted-foreground": "195 10% 46%",
      "--border": "195 15% 91%",
      "--input": "195 15% 91%",
      "--ring": "188 94% 43%",
    }
  },
  { 
    id: "forest", 
    name: "Forest", 
    primary: "#4ade80",
    darkVariables: {
      "--primary": "142 71% 60%",
      "--primary-foreground": "222 47% 6%",
      "--accent": "142 50% 45%",
      "--background": "150 20% 6%",
      "--foreground": "150 20% 96%",
      "--card": "150 20% 9%",
      "--card-foreground": "150 20% 96%",
      "--popover": "150 20% 11%",
      "--popover-foreground": "150 20% 96%",
      "--secondary": "150 20% 14%",
      "--secondary-foreground": "150 20% 96%",
      "--muted": "150 15% 18%",
      "--muted-foreground": "150 10% 55%",
      "--border": "150 15% 18%",
      "--input": "150 20% 14%",
      "--ring": "142 71% 60%",
    },
    lightVariables: {
      "--primary": "142 71% 45%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "142 50% 40%",
      "--background": "0 0% 100%",
      "--foreground": "150 20% 11%",
      "--card": "140 10% 98%",
      "--card-foreground": "150 20% 11%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "150 20% 11%",
      "--secondary": "140 15% 96%",
      "--secondary-foreground": "150 20% 11%",
      "--muted": "140 15% 96%",
      "--muted-foreground": "140 10% 46%",
      "--border": "140 10% 91%",
      "--input": "140 10% 91%",
      "--ring": "142 71% 45%",
    }
  },
  { 
    id: "sunset", 
    name: "Sunset", 
    primary: "#fb923c",
    darkVariables: {
      "--primary": "27 96% 61%",
      "--primary-foreground": "222 47% 6%",
      "--accent": "27 80% 50%",
      "--background": "15 20% 6%",
      "--foreground": "15 20% 96%",
      "--card": "15 20% 9%",
      "--card-foreground": "15 20% 96%",
      "--popover": "15 20% 11%",
      "--popover-foreground": "15 20% 96%",
      "--secondary": "15 20% 14%",
      "--secondary-foreground": "15 20% 96%",
      "--muted": "15 15% 18%",
      "--muted-foreground": "15 10% 55%",
      "--border": "15 15% 18%",
      "--input": "15 20% 14%",
      "--ring": "27 96% 61%",
    },
    lightVariables: {
      "--primary": "27 96% 50%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "27 80% 45%",
      "--background": "0 0% 100%",
      "--foreground": "15 20% 11%",
      "--card": "30 20% 98%",
      "--card-foreground": "15 20% 11%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "15 20% 11%",
      "--secondary": "30 20% 96%",
      "--secondary-foreground": "15 20% 11%",
      "--muted": "30 20% 96%",
      "--muted-foreground": "30 10% 46%",
      "--border": "30 15% 91%",
      "--input": "30 15% 91%",
      "--ring": "27 96% 50%",
    }
  },
  { 
    id: "lavender", 
    name: "Lavender", 
    primary: "#c084fc",
    darkVariables: {
      "--primary": "270 91% 75%",
      "--primary-foreground": "222 47% 6%",
      "--accent": "270 60% 60%",
      "--background": "270 20% 6%",
      "--foreground": "270 20% 96%",
      "--card": "270 20% 9%",
      "--card-foreground": "270 20% 96%",
      "--popover": "270 20% 11%",
      "--popover-foreground": "270 20% 96%",
      "--secondary": "270 20% 14%",
      "--secondary-foreground": "270 20% 96%",
      "--muted": "270 15% 18%",
      "--muted-foreground": "270 10% 55%",
      "--border": "270 15% 18%",
      "--input": "270 20% 14%",
      "--ring": "270 91% 75%",
    },
    lightVariables: {
      "--primary": "270 91% 65%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "270 60% 55%",
      "--background": "0 0% 100%",
      "--foreground": "270 20% 11%",
      "--card": "270 20% 98%",
      "--card-foreground": "270 20% 11%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "270 20% 11%",
      "--secondary": "270 15% 96%",
      "--secondary-foreground": "270 20% 11%",
      "--muted": "270 15% 96%",
      "--muted-foreground": "270 10% 46%",
      "--border": "270 10% 91%",
      "--input": "270 10% 91%",
      "--ring": "270 91% 65%",
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
      return (localStorage.getItem("proxinex-theme") as Theme) || "minimal";
    }
    return "minimal";
  });
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem("proxinex-color-mode") as ColorMode) || "dark";
    }
    return "dark";
  });
  
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPreviewingRef = useRef(false);

  const applyThemeVariables = useCallback((themeId: Theme, mode: ColorMode) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    
    let isDark = mode === "dark";
    if (mode === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    root.classList.toggle("dark", isDark);

    const variables = isDark ? theme.darkVariables : theme.lightVariables;
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.setAttribute("data-theme", themeId);
  }, []);

  // Apply theme and color mode
  useEffect(() => {
    if (isPreviewingRef.current) return;
    
    applyThemeVariables(selectedTheme, colorMode);
    localStorage.setItem("proxinex-theme", selectedTheme);
    localStorage.setItem("proxinex-color-mode", colorMode);
  }, [selectedTheme, colorMode, applyThemeVariables]);

  // Listen for system preference changes
  useEffect(() => {
    if (colorMode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (isPreviewingRef.current) return;
      applyThemeVariables(selectedTheme, colorMode);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [colorMode, selectedTheme, applyThemeVariables]);

  const handleThemeChange = (theme: Theme) => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
    isPreviewingRef.current = false;
    setSelectedTheme(theme);
    onThemeChange?.(theme);
  };

  const handleColorModeChange = (mode: ColorMode) => {
    setColorMode(mode);
    onColorModeChange?.(mode);
  };

  const handleThemeHover = (themeId: Theme) => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    
    isPreviewingRef.current = true;
    applyThemeVariables(themeId, colorMode);
  };

  const handleThemeLeave = () => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    
    previewTimeoutRef.current = setTimeout(() => {
      isPreviewingRef.current = false;
      applyThemeVariables(selectedTheme, colorMode);
    }, 100);
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
                onMouseEnter={() => handleThemeHover(theme.id)}
                onMouseLeave={handleThemeLeave}
                className={`relative flex flex-col items-center p-2 rounded-lg border transition-all ${
                  selectedTheme === theme.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full border-2 mb-1"
                  style={{ 
                    background: theme.id === "minimal" 
                      ? "linear-gradient(135deg, #000 50%, #fff 50%)" 
                      : theme.primary,
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