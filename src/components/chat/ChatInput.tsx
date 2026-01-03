import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Send,
  Globe,
  Cpu,
  Paperclip,
  Sparkles,
  BookOpen,
  GraduationCap,
  Loader2,
  Zap,
  Calculator,
  Users,
  MessageSquare,
  Cloud,
  FileCode,
  FileText,
  Calendar,
  Database,
  ExternalLink,
  AtSign,
  Wand2
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
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Model {
  id: string;
  name: string;
  tag?: "new" | "max" | "fast" | "pro";
  type: "open" | "closed";
  description: string;
  bestFor: string;
}

// Connectors definition
const connectors = [
  { id: "notion", name: "Notion", icon: FileText, connected: true, description: "Search Notion workspace" },
  { id: "github", name: "GitHub", icon: FileCode, connected: true, description: "Search repos & code" },
  { id: "slack", name: "Slack", icon: MessageSquare, connected: false, description: "Search Slack messages" },
  { id: "google-drive", name: "Google Drive", icon: Cloud, connected: false, description: "Access Drive files" },
  { id: "jira", name: "Jira", icon: Calendar, connected: false, description: "Search Jira tickets" },
  { id: "dropbox", name: "Dropbox", icon: Database, connected: false, description: "Access Dropbox files" },
];

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
  { id: "research", label: "Research", icon: Sparkles, description: "Deep search with citations" },
  { id: "web", label: "Web", icon: Globe, description: "General web search" },
  { id: "finance", label: "Finance", icon: Calculator, description: "Financial data & news" },
  { id: "academic", label: "Academic", icon: GraduationCap, description: "Scholarly articles" },
  { id: "social", label: "Social", icon: Users, description: "Social media trends" },
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
  researchMode: boolean;
  onResearchModeChange: (enabled: boolean) => void;
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
  researchMode,
  onResearchModeChange,
}: ChatInputProps) => {
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showSearchModes, setShowSearchModes] = useState(false);
  const [showConnectorMenu, setShowConnectorMenu] = useState(false);
  const [activeModes, setActiveModes] = useState<Record<string, boolean>>({ web: true });
  const [isEnhancing, setIsEnhancing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedModelInfo = [...openSourceModels, ...closedSourceModels].find(m => m.id === selectedModel);

  // Detect @ symbol to show connectors
  useEffect(() => {
    const lastChar = query.slice(-1);
    if (lastChar === "@") {
      setShowConnectorMenu(true);
    } else if (!query.includes("@") || query.endsWith(" ")) {
      setShowConnectorMenu(false);
    }
  }, [query]);

  const handleConnectorSelect = (connector: typeof connectors[0]) => {
    if (connector.connected) {
      // Insert the connector mention
      const newQuery = query.replace(/@$/, `@${connector.id} `);
      setQuery(newQuery);
      setShowConnectorMenu(false);
    }
  };

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

  const handleEnhancePrompt = async () => {
    if (!query.trim() || isEnhancing) return;

    setIsEnhancing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-prompt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: query }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to enhance prompt");
      }

      const data = await response.json();
      
      if (data.changed && data.enhanced) {
        setQuery(data.enhanced);
        toast({
          title: "Prompt Enhanced",
          description: "Your text has been improved with better grammar and clarity.",
        });
      } else {
        toast({
          title: "Already Perfect",
          description: "Your text looks great! No changes needed.",
        });
      }
    } catch (error) {
      console.error("Failed to enhance prompt:", error);
      toast({
        title: "Enhancement Failed",
        description: error instanceof Error ? error.message : "Could not enhance the prompt",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <form onSubmit={onSubmit} className="max-w-3xl mx-auto relative">
        {/* Connector Menu Popover */}
        {showConnectorMenu && (
          <div className="absolute bottom-full mb-2 left-0 right-0 max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2">
                <AtSign className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Mention an app</span>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {connectors.map(connector => (
                <button
                  key={connector.id}
                  type="button"
                  onClick={() => handleConnectorSelect(connector)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                    connector.connected 
                      ? "hover:bg-secondary cursor-pointer" 
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={!connector.connected}
                >
                  <div className={`p-2 rounded-lg ${connector.connected ? "bg-primary/20" : "bg-secondary"}`}>
                    <connector.icon className={`h-4 w-4 ${connector.connected ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{connector.name}</span>
                      {connector.connected ? (
                        <Badge className="bg-primary/20 text-primary text-[10px]">Connected</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Not connected</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{connector.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-2 border-t border-border bg-secondary/50">
              <Link
                to="/app/settings"
                className="flex items-center justify-center gap-2 p-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowConnectorMenu(false)}
              >
                <ExternalLink className="h-3 w-3" />
                Manage apps in Settings
              </Link>
            </div>
          </div>
        )}

        {/* Main Input Container */}
        <div className="bg-input border border-border rounded-xl overflow-hidden">
          {/* Input Row */}
          <div className="flex items-center gap-2 p-3">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything. Type @ for apps and / for shortcuts"
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

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        type="button" 
                        onClick={handleEnhancePrompt}
                        disabled={!query.trim() || isEnhancing}
                        className={`p-2 hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          isEnhancing ? 'animate-pulse' : ''
                        }`}
                      >
                        {isEnhancing ? (
                          <Loader2 className="h-4 w-4 text-primary animate-spin" />
                        ) : (
                          <Wand2 className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enhance prompt with better grammar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Right Actions - Research Mode Toggle */}
            <div className="flex items-center gap-1">
              {/* Research Mode Toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => onResearchModeChange(!researchMode)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                        researchMode 
                          ? 'bg-primary/20 text-primary border border-primary/30' 
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Sparkles className={`h-4 w-4 ${researchMode ? 'text-primary' : ''}`} />
                      <span className="text-xs font-medium">Research</span>
                      <Switch
                        checked={researchMode}
                        onCheckedChange={onResearchModeChange}
                        className="scale-75"
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enable Research Mode for verified citations</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

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
