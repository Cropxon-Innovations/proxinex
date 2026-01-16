import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Brain, 
  FileText, 
  Mic, 
  Video, 
  Link as LinkIcon, 
  Upload,
  Send,
  Presentation,
  BarChart3,
  Network,
  Image as ImageIcon,
  Play,
  Pause,
  Check,
  Loader2,
  Sparkles,
  Plus,
  Trash2,
  Download,
  ChevronRight,
  X,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { useToast } from "@/hooks/use-toast";
import { useMemorixUpload, MemorixSource } from "@/hooks/useMemorixUpload";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface MemoryOutput {
  id: string;
  type: "slides" | "chart" | "video" | "memory-map" | "text";
  title: string;
  content: string;
  createdAt: Date;
}

const MemorixWorkspace = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { sources, fetchSources, uploadFile, addUrl, removeSource } = useMemorixUpload();
  const [outputs, setOutputs] = useState<MemoryOutput[]>([]);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [showProcessingOverlay, setShowProcessingOverlay] = useState(false);
  const [activeOutputTab, setActiveOutputTab] = useState<string>("all");
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadType, setCurrentUploadType] = useState<"pdf" | "doc" | "audio" | "video">("pdf");

  // Fetch sources on mount
  useEffect(() => {
    if (user) {
      fetchSources();
    }
  }, [user, fetchSources]);

  const processingStages = [
    { icon: "📥", label: "Ingesting documents...", progress: 15 },
    { icon: "🧩", label: "Chunking knowledge...", progress: 30 },
    { icon: "🧠", label: "Creating memory embeddings...", progress: 50 },
    { icon: "🔗", label: "Linking concepts...", progress: 70 },
    { icon: "⚡", label: "Routing through Proxinex AI...", progress: 85 },
    { icon: "📊", label: "Generating intelligence...", progress: 100 },
  ];

  const simulateProcessing = useCallback(() => {
    setShowProcessingOverlay(true);
    setProcessingStage(0);
    
    const interval = setInterval(() => {
      setProcessingStage((prev) => {
        if (prev >= 5) {
          clearInterval(interval);
          setTimeout(() => {
            setShowProcessingOverlay(false);
            toast({
              title: "🧠 Intelligence Ready!",
              description: "Your knowledge memory has been built successfully.",
            });
          }, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [toast]);

  const handleFileSelect = (type: "pdf" | "doc" | "audio" | "video") => {
    setCurrentUploadType(type);
    if (fileInputRef.current) {
      // Set accept based on type
      const acceptMap = {
        pdf: ".pdf",
        doc: ".doc,.docx,.txt",
        audio: ".mp3,.wav,.m4a",
        video: ".mp4,.webm,.mov",
      };
      fileInputRef.current.accept = acceptMap[type];
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    for (const file of Array.from(files)) {
      await uploadFile(file, currentUploadType);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddUrl = () => {
    setUrlDialogOpen(true);
  };

  const handleUrlSubmit = async () => {
    if (urlInput.trim()) {
      await addUrl(urlInput.trim());
      setUrlInput("");
      setUrlDialogOpen(false);
    }
  };

  const handleRemoveSource = async (id: string) => {
    await removeSource(id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    setIsProcessing(true);

    try {
      const sourceIds = sources.filter((s) => s.status === "ready").map((s) => s.id);
      
      const { data, error } = await supabase.functions.invoke("memorix-chat", {
        body: {
          message: userMessage,
          sourceIds,
          conversationHistory: chatMessages,
        },
      });

      if (error) throw error;

      if (data?.success && data?.message) {
        setChatMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      } else {
        throw new Error(data?.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "I apologize, but I encountered an error processing your request. Please try again." 
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateOutput = (type: "slides" | "chart" | "video" | "memory-map") => {
    if (sources.filter((s) => s.status === "ready").length === 0) {
      toast({
        title: "No sources ready",
        description: "Please upload and process some documents first.",
        variant: "destructive",
      });
      return;
    }

    simulateProcessing();

    setTimeout(() => {
      const newOutput: MemoryOutput = {
        id: Date.now().toString(),
        type,
        title: `Generated ${type === "memory-map" ? "Memory Map" : type.charAt(0).toUpperCase() + type.slice(1)}`,
        content: `AI-generated ${type} from your knowledge base`,
        createdAt: new Date(),
      };
      setOutputs((prev) => [...prev, newOutput]);
    }, 9000);
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
      case "doc":
        return FileText;
      case "audio":
        return Mic;
      case "video":
        return Video;
      case "url":
        return LinkIcon;
      default:
        return FileText;
    }
  };

  const getOutputIcon = (type: string) => {
    switch (type) {
      case "slides":
        return Presentation;
      case "chart":
        return BarChart3;
      case "video":
        return Video;
      case "memory-map":
        return Network;
      default:
        return FileText;
    }
  };

  return (
    <>
      <Helmet>
        <title>Memorix Workspace - Intelligence Memory Engine | Proxinex</title>
        <meta 
          name="description" 
          content="Build and query your AI-powered knowledge memory with Proxinex Memorix." 
        />
      </Helmet>

      <div className="h-screen flex bg-background overflow-hidden">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          user={user}
          onSignOut={signOut}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader
            title="Memorix"
            subtitle="Intelligence Memory Engine"
            icon={<Brain className="h-5 w-5 text-primary" />}
          >
            <Badge variant="outline" className="ml-2 text-[10px]">BETA</Badge>
          </AppHeader>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Sources */}
            <div className="w-72 border-r border-border flex flex-col bg-card/30">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-sm text-foreground mb-3">Sources</h3>
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleFileSelect("pdf")}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleFileSelect("doc")}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Doc
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleFileSelect("audio")}
                  >
                    <Mic className="h-3.5 w-3.5" />
                    Audio
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleFileSelect("video")}
                  >
                    <Video className="h-3.5 w-3.5" />
                    Video
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 gap-1.5 text-xs"
                  onClick={handleAddUrl}
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  Add URL
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                  {sources.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No sources uploaded yet</p>
                    </div>
                  ) : (
                    sources.map((source) => {
                      const Icon = getSourceIcon(source.type);
                      return (
                        <div
                          key={source.id}
                          className="p-3 rounded-lg border border-border bg-card group hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{source.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {source.file_size ? `${(source.file_size / 1024 / 1024).toFixed(1)} MB` : source.type.toUpperCase()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveSource(source.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
                            >
                              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                          {source.status !== "ready" && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-[10px] mb-1">
                                <span className="text-muted-foreground">
                                  {source.status === "uploading" ? "Uploading..." : "Processing..."}
                                </span>
                                <span className="text-muted-foreground">{source.progress}%</span>
                              </div>
                              <Progress value={source.progress} className="h-1" />
                            </div>
                          )}
                          {source.status === "ready" && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-primary">
                              <Check className="h-3 w-3" />
                              <span>Ready</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {sources.filter((s) => s.status === "ready").length > 0 && (
                <div className="p-3 border-t border-border">
                  <Button
                    className="w-full gap-2"
                    onClick={() => simulateProcessing()}
                  >
                    <Brain className="h-4 w-4" />
                    Build Memory
                  </Button>
                </div>
              )}
            </div>

            {/* Middle Panel - Chat */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="p-4 border-b border-border bg-card/30">
                <h3 className="font-semibold text-sm text-foreground">Ask Memorix</h3>
                <p className="text-xs text-muted-foreground">Query your knowledge memory</p>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <h4 className="font-medium text-foreground mb-2">Start a Conversation</h4>
                      <p className="text-xs max-w-sm mx-auto">
                        Upload your knowledge sources and ask questions to generate insights, summaries, and visualizations.
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-xl ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card border border-border"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-card border border-border p-4 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card/30">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about your knowledge..."
                    className="flex-1 px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    disabled={isProcessing}
                  />
                  <Button type="submit" disabled={isProcessing || !inputMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Panel - Outputs */}
            <div className="w-80 border-l border-border flex flex-col bg-card/30">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-sm text-foreground mb-3">Generate Output</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleGenerateOutput("slides")}
                  >
                    <Presentation className="h-3.5 w-3.5" />
                    Slides
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleGenerateOutput("chart")}
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    Charts
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleGenerateOutput("video")}
                  >
                    <Video className="h-3.5 w-3.5" />
                    Video
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleGenerateOutput("memory-map")}
                  >
                    <Network className="h-3.5 w-3.5" />
                    Memory Map
                  </Button>
                </div>
              </div>

              <Tabs value={activeOutputTab} onValueChange={setActiveOutputTab} className="flex-1 flex flex-col">
                <TabsList className="mx-4 mt-2 grid grid-cols-4">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="slides" className="text-xs">Slides</TabsTrigger>
                  <TabsTrigger value="charts" className="text-xs">Charts</TabsTrigger>
                  <TabsTrigger value="video" className="text-xs">Video</TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-2">
                    {outputs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No outputs generated yet</p>
                      </div>
                    ) : (
                      outputs
                        .filter((o) => activeOutputTab === "all" || o.type.includes(activeOutputTab))
                        .map((output) => {
                          const Icon = getOutputIcon(output.type);
                          return (
                            <div
                              key={output.id}
                              className="p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{output.title}</p>
                                  <p className="text-xs text-muted-foreground">{output.content}</p>
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    {output.createdAt.toLocaleTimeString()}
                                  </p>
                                </div>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </ScrollArea>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Processing Overlay */}
        {showProcessingOverlay && (
          <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="max-w-lg w-full mx-4 p-8 rounded-2xl border border-border bg-card">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Building your Intelligence Memory…</h3>
                <p className="text-muted-foreground">Processing {sources.filter(s => s.status === "ready").length} sources</p>
              </div>

              <div className="space-y-4">
                {processingStages.map((stage, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                      index <= processingStage
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-secondary/50 border border-transparent opacity-50"
                    }`}
                  >
                    <span className="text-2xl">{stage.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${index <= processingStage ? "text-foreground" : "text-muted-foreground"}`}>
                        {stage.label}
                      </p>
                    </div>
                    {index < processingStage && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                    {index === processingStage && (
                      <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    )}
                  </div>
                ))}
              </div>

              {/* Achievement Badges */}
              <div className="mt-8 flex items-center justify-center gap-3">
                <Badge variant="outline" className={`px-3 py-1.5 transition-all ${processingStage >= 2 ? "border-primary/50 text-primary scale-105" : "opacity-30"}`}>
                  🏅 Knowledge Indexed
                </Badge>
                <Badge variant="outline" className={`px-3 py-1.5 transition-all ${processingStage >= 4 ? "border-primary/50 text-primary scale-105" : "opacity-30"}`}>
                  🧠 Memory Created
                </Badge>
                <Badge variant="outline" className={`px-3 py-1.5 transition-all ${processingStage >= 5 ? "border-primary/50 text-primary scale-105" : "opacity-30"}`}>
                  ⚡ Intelligence Ready
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* URL Dialog */}
        <Dialog open={urlDialogOpen} onOpenChange={setUrlDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add URL Source</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="https://example.com/document"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setUrlDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
                  Add URL
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default MemorixWorkspace;
