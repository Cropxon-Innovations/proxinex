import { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type ColorMode = "dark" | "light" | "system";

const getSystemTheme = (): "dark" | "light" => {
  if (typeof window !== 'undefined') {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
};

const applyTheme = (mode: ColorMode) => {
  const root = document.documentElement;
  
  if (mode === "system") {
    const systemTheme = getSystemTheme();
    root.classList.toggle("dark", systemTheme === "dark");
  } else {
    root.classList.toggle("dark", mode === "dark");
  }
};

export const ThemeToggle = () => {
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem("proxinex-color-mode") as ColorMode) || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    applyTheme(colorMode);
    localStorage.setItem("proxinex-color-mode", colorMode);
  }, [colorMode]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (colorMode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [colorMode]);

  const handleThemeChange = (mode: ColorMode) => {
    setColorMode(mode);
  };

  const getCurrentIcon = () => {
    if (colorMode === "system") {
      return <Monitor className="h-4 w-4" />;
    }
    return colorMode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
        >
          {getCurrentIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border">
        <DropdownMenuItem 
          onClick={() => handleThemeChange("light")}
          className={`gap-2 cursor-pointer ${colorMode === "light" ? "bg-secondary" : ""}`}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("dark")}
          className={`gap-2 cursor-pointer ${colorMode === "dark" ? "bg-secondary" : ""}`}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("system")}
          className={`gap-2 cursor-pointer ${colorMode === "system" ? "bg-secondary" : ""}`}
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
