import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Keyboard, Command, Settings2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Shortcut {
  id: string;
  label: string;
  keys: string[];
  action: string;
  category: "navigation" | "actions" | "editing";
  enabled: boolean;
}

const defaultShortcuts: Shortcut[] = [
  { id: "command-palette", label: "Open Command Palette", keys: ["⌘", "K"], action: "openCommandPalette", category: "navigation", enabled: true },
  { id: "new-chat", label: "New Chat", keys: ["⌘", "N"], action: "newChat", category: "navigation", enabled: true },
  { id: "search", label: "Search", keys: ["⌘", "F"], action: "search", category: "navigation", enabled: true },
  { id: "settings", label: "Open Settings", keys: ["⌘", ","], action: "openSettings", category: "navigation", enabled: true },
  { id: "toggle-sidebar", label: "Toggle Sidebar", keys: ["⌘", "B"], action: "toggleSidebar", category: "navigation", enabled: true },
  { id: "toggle-theme", label: "Toggle Theme", keys: ["⌘", "Shift", "L"], action: "toggleTheme", category: "actions", enabled: true },
  { id: "send-message", label: "Send Message", keys: ["⌘", "Enter"], action: "sendMessage", category: "editing", enabled: true },
  { id: "new-line", label: "New Line", keys: ["Shift", "Enter"], action: "newLine", category: "editing", enabled: true },
  { id: "clear-input", label: "Clear Input", keys: ["⌘", "Shift", "Backspace"], action: "clearInput", category: "editing", enabled: true },
  { id: "copy-response", label: "Copy Last Response", keys: ["⌘", "Shift", "C"], action: "copyResponse", category: "actions", enabled: true },
  { id: "regenerate", label: "Regenerate Response", keys: ["⌘", "Shift", "R"], action: "regenerate", category: "actions", enabled: true },
  { id: "focus-input", label: "Focus Input", keys: ["Escape"], action: "focusInput", category: "editing", enabled: true },
];

const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;

const formatKey = (key: string) => {
  if (!isMac) {
    return key.replace("⌘", "Ctrl").replace("⌥", "Alt");
  }
  return key;
};

export const KeyboardShortcutsButton = () => {
  const [open, setOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => {
    const saved = localStorage.getItem("proxinex-shortcuts");
    return saved ? JSON.parse(saved) : defaultShortcuts;
  });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    localStorage.setItem("proxinex-shortcuts", JSON.stringify(shortcuts));
  }, [shortcuts]);

  const toggleShortcut = (id: string) => {
    setShortcuts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const resetToDefaults = () => {
    setShortcuts(defaultShortcuts);
  };

  const filteredShortcuts = activeTab === "all" 
    ? shortcuts 
    : shortcuts.filter((s) => s.category === activeTab);

  const categories = [
    { id: "all", label: "All" },
    { id: "navigation", label: "Navigation" },
    { id: "actions", label: "Actions" },
    { id: "editing", label: "Editing" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Keyboard className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {filteredShortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={shortcut.enabled}
                      onCheckedChange={() => toggleShortcut(shortcut.id)}
                      className="scale-75"
                    />
                    <span className={`text-sm ${!shortcut.enabled && "text-muted-foreground"}`}>
                      {shortcut.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <span key={i}>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-1.5 py-0.5 font-mono ${!shortcut.enabled && "opacity-50"}`}
                        >
                          {formatKey(key)}
                        </Badge>
                        {i < shortcut.keys.length - 1 && (
                          <span className="text-muted-foreground mx-0.5">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {isMac ? "Using macOS shortcuts" : "Using Windows/Linux shortcuts"}
          </p>
          <Button variant="outline" size="sm" onClick={resetToDefaults}>
            <Settings2 className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const KeyboardShortcutsIndicator = () => {
  return (
    <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
      <Badge variant="outline" className="text-[10px] px-1 py-0 font-mono">
        {isMac ? "⌘" : "Ctrl"}
      </Badge>
      <span>+</span>
      <Badge variant="outline" className="text-[10px] px-1 py-0 font-mono">
        K
      </Badge>
      <span className="ml-1">for commands</span>
    </div>
  );
};
