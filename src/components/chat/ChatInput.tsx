import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Send,
  Globe,
  Cpu,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Video,
  Sparkles,
  BookOpen,
  ShoppingCart,
  GraduationCap,
  MoreHorizontal,
  Loader2,
  Zap,
  Calculator,
  Briefcase,
  Users
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VoiceInput } from "@/components/chat/VoiceInput";

interface Model {
  id: string;
  name: string;
  tag?: "new" | "max" | "fast" | "pro";
  type: "open" | "closed";
  description: string;
  bestFor: string;
}

const openSourceModels: Model[] = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", tag: "new", type: "open", description: "Fast & efficient for everyday tasks", bestFor: "Quick responses, summarization, simple Q&A" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", tag: "max", type: "open", description: "Most capable Gemini model", bestFor: "Complex reasoning, coding, analysis" },
  { id: "gemini-3-pro", name: "Gemini 3 Pro", tag: "new", type: "open", description: "Next-gen multimodal model", bestFor: "Image understanding, long context" },
  { id: "llama-3.3-70b", name: "Llama 3.3 70B", type: "open", description: "Meta's open source powerhouse", bestFor: "General tasks, open-weight flexibility" },
  { id: "mistral-large", name: "Mistral Large", type: "open", description: "Strong European open model", bestFor: "Multilingual, reasoning" },
  { id: "deepseek-r1", name: "DeepSeek R1", tag: "new", type: "open", description: "Advanced reasoning model", bestFor: "Math, logic, step-by-step thinking" },
];

const closedSourceModels: Model[] = [
  { id: "gpt-5", name: "GPT-5", tag: "max", type: "closed", description: "OpenAI's most powerful model", bestFor: "Complex reasoning, creativity, coding" },
  { id: "gpt-5-mini", name: "GPT-5 Mini", type: "closed", description: "Fast and cost-effective", bestFor: "Everyday tasks, quick responses" },
  { id: "claude-opus-4.5", name: "Claude Opus 4.5", tag: "max", type: "closed", description: "Most intelligent Anthropic model", bestFor: "Deep analysis, nuanced writing" },
  { id: "claude-sonnet-4.5", name: "Claude Sonnet 4.5", tag: "pro", type: "closed", description: "Balanced performance", bestFor: "General purpose, reliable" },
  { id: "o3", name: "o3", tag: "new", type: "closed", description: "Advanced reasoning model", bestFor: "Multi-step problems, math, logic" },
  { id: "grok-3", name: "Grok 3", type: "closed", description: "xAI's latest model", bestFor: "Real-time info, casual conversation" },
];

const searchModes = [
  { id: "web", label: "Web", icon: Globe, enabled: true },
  { id: "finance", label: "Finance", icon: Calculator, enabled: false },
  { id: "academic", label: "Academic", icon: GraduationCap, enabled: false },
  { id: "social", label: "Social", icon: Users, enabled: false },
];

const quickActions = [
  { id: "files", label: "Add photos & files", icon: Paperclip },
  { id: "create-image", label: "Create image", icon: ImageIcon },
  { id: "deep-research", label: "Deep research", icon: Sparkles },
  { id: "shopping", label: "Shopping research", icon: ShoppingCart },
  { id: "study", label: "Study and learn", icon: GraduationCap },
];

const moreActions = [
  { id: "web-search", label: "Web search", icon: Globe },
  { id: "canvas", label: "Canvas", icon: FileText },
  { id: "explore", label: "Explore apps", icon: Briefcase },
];

const quickChips = [
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "research", label: "Research", icon: Sparkles },
  { id: "analyze", label: "Analyze", icon: Zap },
];

interface ChatInputProps {
  query: string;
  setQuery: (query: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onFileUpload?: (files: FileList) => void;
  onImageUpload?: (files: FileList) => void;
  onVideoUpload?: (files: FileList) => void;
  onVoiceStart?: () => void;
  onVoiceStop?: () => void;
  isRecording?: boolean;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  autoMode: boolean;
  onAutoModeChange: (auto: boolean) => void;
}

export const ChatInput = ({
  query,
  setQuery,
  isLoading,
  onSubmit,
  onFileUpload,
  onImageUpload,
  onVideoUpload,
  onVoiceStart,
  onVoiceStop,
  isRecording = false,
  selectedModel,
  onModelChange,
  autoMode,
  onAutoModeChange,
}: ChatInputProps) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showSearchModes, setShowSearchModes] = useState(false);
  const [activeModes, setActiveModes] = useState<Record<string, boolean>>({ web: true });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const selectedModelInfo = [...openSourceModels, ...closedSourceModels].find(m => m.id === selectedModel);

  const getTagColor = (tag?: string) => {
    switch (tag) {
      case "new": return "bg-primary/20 text-primary";
      case "max": return "bg-accent/20 text-accent";
      case "fast": return "bg-success/20 text-success";
      case "pro": return "bg-warning/20 text-warning";
      default: return "";
    }
  };

  const handleModeToggle = (modeId: string) => {
    setActiveModes(prev => ({ ...prev, [modeId]: !prev[modeId] }));
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <form onSubmit={onSubmit} className="max-w-3xl mx-auto">
        {/* Main Input Container */}
        <div className="bg-input border border-border rounded-xl overflow-hidden">
          {/* Input Row */}
          <div className="flex items-center gap-2 p-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything. Type @ for mentions and / for shortcuts"
              disabled={isLoading}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!query.trim() || isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between px-3 pb-3">
            {/* Left Actions */}
            <div className="flex items-center gap-1">
              {/* Quick Action Buttons */}
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <Popover open={showSearchModes} onOpenChange={setShowSearchModes}>
                  <PopoverTrigger asChild>
                    <button type="button" className="p-2 hover:bg-secondary transition-colors">
                      <Globe className={`h-4 w-4 ${activeModes.web ? "text-primary" : "text-muted-foreground"}`} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2" align="start">
                    <div className="space-y-1">
                      {searchModes.map(mode => (
                        <div key={mode.id} className="flex items-center justify-between p-2 rounded hover:bg-secondary">
                          <div className="flex items-center gap-2">
                            <mode.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{mode.label}</span>
                          </div>
                          <Switch
                            checked={activeModes[mode.id] || false}
                            onCheckedChange={() => handleModeToggle(mode.id)}
                            className="scale-75"
                          />
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="w-px h-5 bg-border" />

                <Popover open={showModelSelector} onOpenChange={setShowModelSelector}>
                  <PopoverTrigger asChild>
                    <button type="button" className="p-2 hover:bg-secondary transition-colors flex items-center gap-1">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="start">
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Auto Mode</span>
                        <Switch checked={autoMode} onCheckedChange={onAutoModeChange} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {autoMode ? "Proxinex selects the best model" : "Choose your preferred model"}
                      </p>
                    </div>

                    {!autoMode && (
                      <div className="max-h-80 overflow-y-auto">
                        <div className="p-2">
                          <div className="text-xs font-medium text-muted-foreground px-2 py-1">Open Source</div>
                          {openSourceModels.map(model => (
                            <TooltipProvider key={model.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => { onModelChange(model.id); setShowModelSelector(false); }}
                                    className={`w-full flex items-center justify-between p-2 rounded hover:bg-secondary text-left ${selectedModel === model.id ? "bg-secondary" : ""}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">{model.name}</span>
                                      {model.tag && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase font-medium ${getTagColor(model.tag)}`}>
                                          {model.tag}
                                        </span>
                                      )}
                                    </div>
                                    {selectedModel === model.id && (
                                      <span className="text-primary">✓</span>
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs">
                                  <p className="font-medium mb-1">{model.description}</p>
                                  <p className="text-xs text-muted-foreground">Best for: {model.bestFor}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>

                        <div className="border-t border-border p-2">
                          <div className="text-xs font-medium text-muted-foreground px-2 py-1">Closed Source</div>
                          {closedSourceModels.map(model => (
                            <TooltipProvider key={model.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => { onModelChange(model.id); setShowModelSelector(false); }}
                                    className={`w-full flex items-center justify-between p-2 rounded hover:bg-secondary text-left ${selectedModel === model.id ? "bg-secondary" : ""}`}
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">{model.name}</span>
                                        {model.tag && (
                                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase font-medium ${getTagColor(model.tag)}`}>
                                            {model.tag}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {selectedModel === model.id && (
                                      <span className="text-primary">✓</span>
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs">
                                  <p className="font-medium mb-1">{model.description}</p>
                                  <p className="text-xs text-muted-foreground">Best for: {model.bestFor}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>

                <div className="w-px h-5 bg-border" />

                <button type="button" className="p-2 hover:bg-secondary transition-colors">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Actions Menu */}
              <Popover open={showActionsMenu} onOpenChange={setShowActionsMenu}>
                <PopoverTrigger asChild>
                  <button type="button" className="p-2 hover:bg-secondary rounded-lg transition-colors">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="space-y-1">
                      {quickActions.map(action => (
                        <button
                          key={action.id}
                          type="button"
                          onClick={() => {
                            if (action.id === "files") fileInputRef.current?.click();
                            setShowActionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 text-sm hover:bg-secondary rounded transition-colors text-left"
                        >
                          <action.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs">{action.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="space-y-1">
                      {moreActions.map(action => (
                        <button
                          key={action.id}
                          type="button"
                          className="w-full flex items-center gap-2 p-2 text-sm hover:bg-secondary rounded transition-colors text-left"
                        >
                          <action.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* File Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Voice Input */}
              <VoiceInput
                onTranscript={(text) => setQuery(query + " " + text)}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Quick Chips */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {quickChips.map(chip => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setQuery(chip.label + " ")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary text-muted-foreground hover:text-foreground rounded-full transition-colors"
            >
              <chip.icon className="h-3 w-3" />
              {chip.label}
            </button>
          ))}
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && onFileUpload?.(e.target.files)}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && onImageUpload?.(e.target.files)}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => e.target.files && onVideoUpload?.(e.target.files)}
        />
      </form>
    </div>
  );
};
