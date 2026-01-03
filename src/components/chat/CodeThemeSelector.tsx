import { useState, useEffect } from "react";
import { Code, Check, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export type CodeTheme = "monokai" | "github" | "one-dark" | "dracula" | "nord";

export interface CodeThemeConfig {
  id: CodeTheme;
  name: string;
  bg: string;
  text: string;
  keyword: string;
  string: string;
  comment: string;
  number: string;
  function: string;
  type: string;
  operator: string;
}

export const codeThemes: CodeThemeConfig[] = [
  {
    id: "monokai",
    name: "Monokai",
    bg: "bg-[#272822]",
    text: "text-[#f8f8f2]",
    keyword: "text-[#f92672]",
    string: "text-[#e6db74]",
    comment: "text-[#75715e]",
    number: "text-[#ae81ff]",
    function: "text-[#a6e22e]",
    type: "text-[#66d9ef]",
    operator: "text-[#f8f8f2]",
  },
  {
    id: "github",
    name: "GitHub",
    bg: "bg-[#f6f8fa] dark:bg-[#0d1117]",
    text: "text-[#24292f] dark:text-[#c9d1d9]",
    keyword: "text-[#cf222e] dark:text-[#ff7b72]",
    string: "text-[#0a3069] dark:text-[#a5d6ff]",
    comment: "text-[#6e7781] dark:text-[#8b949e]",
    number: "text-[#0550ae] dark:text-[#79c0ff]",
    function: "text-[#8250df] dark:text-[#d2a8ff]",
    type: "text-[#953800] dark:text-[#ffa657]",
    operator: "text-[#24292f] dark:text-[#c9d1d9]",
  },
  {
    id: "one-dark",
    name: "One Dark",
    bg: "bg-[#282c34]",
    text: "text-[#abb2bf]",
    keyword: "text-[#c678dd]",
    string: "text-[#98c379]",
    comment: "text-[#5c6370]",
    number: "text-[#d19a66]",
    function: "text-[#61afef]",
    type: "text-[#e5c07b]",
    operator: "text-[#abb2bf]",
  },
  {
    id: "dracula",
    name: "Dracula",
    bg: "bg-[#282a36]",
    text: "text-[#f8f8f2]",
    keyword: "text-[#ff79c6]",
    string: "text-[#f1fa8c]",
    comment: "text-[#6272a4]",
    number: "text-[#bd93f9]",
    function: "text-[#50fa7b]",
    type: "text-[#8be9fd]",
    operator: "text-[#f8f8f2]",
  },
  {
    id: "nord",
    name: "Nord",
    bg: "bg-[#2e3440]",
    text: "text-[#d8dee9]",
    keyword: "text-[#81a1c1]",
    string: "text-[#a3be8c]",
    comment: "text-[#616e88]",
    number: "text-[#b48ead]",
    function: "text-[#88c0d0]",
    type: "text-[#8fbcbb]",
    operator: "text-[#d8dee9]",
  },
];

const STORAGE_KEY = "proxinex-code-theme";

export function useCodeTheme() {
  const [theme, setTheme] = useState<CodeTheme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(STORAGE_KEY) as CodeTheme) || "github";
    }
    return "github";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const themeConfig = codeThemes.find((t) => t.id === theme) || codeThemes[1];

  return { theme, setTheme, themeConfig };
}

export function CodeThemeSelector() {
  const { theme, setTheme, themeConfig } = useCodeTheme();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Code className="h-4 w-4" />
          <span className="text-xs">{themeConfig.name}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-2">
        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
          Code Theme
        </div>
        {codeThemes.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTheme(t.id);
              setOpen(false);
            }}
            className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors ${
              theme === t.id ? "bg-secondary" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded ${t.bg} border border-border`}
              />
              <span className="text-sm">{t.name}</span>
            </div>
            {theme === t.id && <Check className="h-4 w-4 text-primary" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
