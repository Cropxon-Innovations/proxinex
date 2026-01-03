import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  MessageSquare,
  Search,
  Layers,
  BookOpen,
  FileText,
  Image,
  Video,
  Code,
  BarChart3,
  Key,
  Settings,
  Plus,
  Moon,
  Sun,
  FolderOpen,
  HelpCircle,
  Sparkles,
  Home,
} from "lucide-react";

const navigationItems = [
  { icon: Home, label: "Home", path: "/", group: "Navigation" },
  { icon: Plus, label: "New Session", path: "/app", group: "Navigation" },
  { icon: MessageSquare, label: "Chat", path: "/app/chat", group: "Navigation" },
  { icon: Search, label: "Research", path: "/app/research", group: "Navigation" },
  { icon: Layers, label: "Sandbox", path: "/app/sandbox", group: "Navigation" },
  { icon: BookOpen, label: "Notebooks", path: "/app/notebooks", group: "Navigation" },
  { icon: FileText, label: "Documents", path: "/app/documents", group: "Navigation" },
  { icon: Image, label: "Images", path: "/app/images", group: "Navigation" },
  { icon: Video, label: "Video", path: "/app/video", group: "Navigation" },
  { icon: FolderOpen, label: "Projects", path: "/app/projects", group: "Navigation" },
  { icon: Code, label: "API Playground", path: "/app/api", group: "Navigation" },
];

const toolsItems = [
  { icon: BarChart3, label: "Usage & Cost", path: "/app/usage", group: "Tools" },
  { icon: Key, label: "API Keys", path: "/app/api-keys", group: "Tools" },
  { icon: Settings, label: "Settings", path: "/app/settings", group: "Tools" },
  { icon: HelpCircle, label: "Help Center", path: "/app/help", group: "Tools" },
  { icon: Sparkles, label: "Personalization", path: "/app/personalization", group: "Tools" },
];

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CommandPalette = ({ open: controlledOpen, onOpenChange }: CommandPaletteProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const handleOpenChange = onOpenChange || setOpen;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleOpenChange(!isOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, handleOpenChange]);

  const handleSelect = (path: string) => {
    handleOpenChange(false);
    navigate(path);
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    root.classList.toggle("dark", !isDark);
    localStorage.setItem("proxinex-color-mode", isDark ? "light" : "dark");
    handleOpenChange(false);
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
      <CommandInput placeholder="Search pages, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.path}
              onSelect={() => handleSelect(item.path)}
              className="gap-2"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Tools & Settings">
          {toolsItems.map((item) => (
            <CommandItem
              key={item.path}
              onSelect={() => handleSelect(item.path)}
              className="gap-2"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={toggleTheme} className="gap-2">
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="h-4 w-4 hidden dark:block" />
            <span>Toggle Theme</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
