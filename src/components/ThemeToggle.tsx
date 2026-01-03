import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

type ColorMode = "dark" | "light";

export const ThemeToggle = () => {
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem("proxinex-color-mode") as ColorMode) || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", colorMode === "dark");
    localStorage.setItem("proxinex-color-mode", colorMode);
  }, [colorMode]);

  const toggleTheme = () => {
    setColorMode(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9"
    >
      {colorMode === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
};
