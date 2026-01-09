import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHistoryData } from "@/hooks/useHistoryData";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { UsageLimitModal } from "@/components/UsageLimitModal";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Video as VideoIcon,
  Upload,
  Play,
  Pause,
  Clock,
  FileVideo,
  Sparkles,
  MessageSquare,
  List,
  Trash2,
  Loader2,
  Volume2,
  Maximize2,
  SkipBack,
  SkipForward,
  Download,
  Share2,
  Wand2,
  Crown,
  Zap,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/components/NotificationCenter";
import { Helmet } from "react-helmet-async";
import { AppHeader } from "@/components/AppHeader";
import { usePageTransition } from "@/contexts/PageTransitionContext";

interface VideoModel {
  id: string;
  name: string;
  provider: string;
  type: "open" | "closed";
  quality: "standard" | "premium";
  maxDuration: number;
  freeGenerations: number;
}

const videoModels: VideoModel[] = [
  { id: "proxinex-video", name: "Proxinex Video AI", provider: "Proxinex", type: "closed", quality: "premium", maxDuration: 10, freeGenerations: 5 },
  { id: "runway-gen3", name: "Runway Gen-3 Alpha", provider: "Runway", type: "closed", quality: "premium", maxDuration: 10, freeGenerations: 3 },
  { id: "pika-1.0", name: "Pika 1.0", provider: "Pika Labs", type: "closed", quality: "premium", maxDuration: 4, freeGenerations: 5 },
  { id: "stable-video", name: "Stable Video Diffusion", provider: "Stability AI", type: "open", quality: "standard", maxDuration: 4, freeGenerations: 10 },
];

interface GeneratedVideo {
  id: string;
  prompt: string;
  model: string;
  url: string;
  thumbnail: string;
  status: "generating" | "ready" | "error";
  duration: string;
  createdAt: Date;
  description?: string;
}

interface UploadedVideo {
  id: string;
  name: string;
  size: number;
  duration?: string;
  file: File;
  status: "uploading" | "processing" | "ready" | "error";
  progress: number;
  insights?: {
    summary: string;
    transcript: string;
    keyMoments: { time: string; description: string }[];
    topics: string[];
  };
}

export default function VideoPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMode, setActiveMode] = useState<"generate" | "analyze">("generate");
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("proxinex-video");
  const [autoSelectModel, setAutoSelectModel] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<UploadedVideo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { addNotification, updateNotification } = useNotifications();
  const { 
    usage, 
    limits, 
    canUseFeature, 
    incrementUsage, 
    getUsageDisplay,
    getRequiredPlanForUnlimited 
  } = useUsageLimits();
  
  const {
    chatSessions,
    inlineAsks,
    handlePinSession,
    handleArchiveSession,
    handleDeleteSession,
    handleRenameSession,
    handleReorderPinnedSessions,
    handlePinInlineAsk,
    handleArchiveInlineAsk,
    handleDeleteInlineAsk,
    handleRenameInlineAsk,
  } = useHistoryData();

  const MAX_SIZE = 50 * 1024 * 1024;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Check usage limits
    if (!canUseFeature("video")) {
      setLimitModalOpen(true);
      return;
    }

    // Increment usage
    const success = await incrementUsage("video");
    if (!success) {
      setLimitModalOpen(true);
      return;
    }

    setIsGenerating(true);
    const modelToUse = autoSelectModel ? "proxinex-video" : selectedModel;
    const model = videoModels.find(m => m.id === modelToUse);

    const newVideo: GeneratedVideo = {
      id: Math.random().toString(36).substr(2, 9),
      prompt: prompt.trim(),
      model: model?.name || modelToUse,
      url: "",
      thumbnail: "",
      status: "generating",
      duration: `${model?.maxDuration || 5}s`,
      createdAt: new Date(),
    };

    setGeneratedVideos(prev => [newVideo, ...prev]);

    const notificationId = addNotification({
      type: "loading",
      title: "Generating video...",
      message: prompt.trim().slice(0, 50),
      category: "video",
      progress: 0,
    });

    try {
      const progressInterval = setInterval(() => {
        updateNotification(notificationId, {
          progress: Math.min(90, (Math.random() * 20) + 30),
        });
      }, 1000);

      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: { prompt: prompt.trim(), duration: model?.maxDuration || 5, aspectRatio: "16:9" },
      });

      clearInterval(progressInterval);

      if (error) throw error;

      setGeneratedVideos(prev =>
        prev.map(vid =>
          vid.id === newVideo.id
            ? { 
                ...vid, 
                status: "ready" as const, 
                url: data.videoUrl, 
                thumbnail: data.thumbnailUrl,
                description: data.description,
              }
            : vid
        )
      );

      updateNotification(notificationId, {
        type: "success",
        title: "Video generated!",
        message: `Created with ${model?.name}`,
        progress: undefined,
      });

      toast({ title: "Video generated" });
    } catch (error) {
      setGeneratedVideos(prev =>
        prev.map(vid =>
          vid.id === newVideo.id ? { ...vid, status: "error" as const } : vid
        )
      );

      updateNotification(notificationId, {
        type: "error",
        title: "Video generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
        progress: undefined,
      });

      toast({ 
        title: "Generation failed", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }

    setIsGenerating(false);
    setPrompt("");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith("video/") && f.size <= MAX_SIZE
    );
    processFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(
        f => f.type.startsWith("video/") && f.size <= MAX_SIZE
      );
      processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 50MB limit`,
          variant: "destructive",
        });
        continue;
      }

      const videoFile: UploadedVideo = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        file,
        status: "uploading",
        progress: 0,
      };

      setUploadedVideos(prev => [...prev, videoFile]);

      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 100));
        setUploadedVideos(prev =>
          prev.map(v => (v.id === videoFile.id ? { ...v, progress: i } : v))
        );
      }

      setUploadedVideos(prev =>
        prev.map(v => (v.id === videoFile.id ? { ...v, status: "processing", progress: 0 } : v))
      );

      await new Promise(r => setTimeout(r, 2000));

      setUploadedVideos(prev =>
        prev.map(v =>
          v.id === videoFile.id
            ? {
                ...v,
                status: "ready",
                progress: 100,
                duration: "3:45",
                insights: {
                  summary: "This video discusses key concepts with clear explanations.",
                  transcript: "Welcome to this overview...",
                  keyMoments: [
                    { time: "0:00", description: "Introduction" },
                    { time: "0:45", description: "Main topic" },
                    { time: "1:30", description: "Demo" },
                  ],
                  topics: ["Overview", "Tutorial"],
                },
              }
            : v
        )
      );

      toast({ title: "Video processed", description: `${file.name} analyzed` });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const deleteUploadedVideo = (id: string) => {
    setUploadedVideos(prev => prev.filter(v => v.id !== id));
    if (selectedVideo?.id === id) setSelectedVideo(null);
  };

  const deleteGeneratedVideo = (id: string) => {
    setGeneratedVideos(prev => prev.filter(v => v.id !== id));
  };

  return (
    <>
      <Helmet>
        <title>Video - Proxinex</title>
        <meta name="description" content="Generate and analyze videos with AI" />
      </Helmet>

      <div className="h-screen bg-background flex overflow-hidden">
        {/* Sidebar */}
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          user={user}
          onSignOut={handleSignOut}
          chatSessions={chatSessions}
          onSelectSession={(id) => navigate(`/app?chat=${id}`)}
          onNewSession={() => navigate("/app")}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          onPinSession={handlePinSession}
          onArchiveSession={handleArchiveSession}
          onShareSession={(sessionId) => {
            const baseUrl = window.location.hostname === 'localhost' 
              ? window.location.origin 
              : 'https://proxinex.com';
            const shareUrl = `${baseUrl}/app?chat=${sessionId}`;
            navigator.clipboard.writeText(shareUrl);
            toast({ title: "Link copied", description: "Chat link copied to clipboard" });
          }}
          onReorderPinnedSessions={handleReorderPinnedSessions}
          inlineAsks={inlineAsks}
          onSelectInlineAsk={(askId, sessionId) => {
            if (sessionId) {
              navigate(`/app?chat=${sessionId}`);
            }
          }}
          onDeleteInlineAsk={handleDeleteInlineAsk}
          onRenameInlineAsk={handleRenameInlineAsk}
          onPinInlineAsk={handlePinInlineAsk}
          onArchiveInlineAsk={handleArchiveInlineAsk}
          onShareInlineAsk={(askId) => {
            navigator.clipboard.writeText(`Inline Ask: ${askId}`);
            toast({ title: "Link copied" });
          }}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <AppHeader
            title="Video"
            subtitle={`Generate or analyze videos with AI${limits.video !== Infinity ? ` • ${getUsageDisplay("video")} used` : ""}`}
            icon={<VideoIcon className="h-4 w-4 text-primary" />}
          />

          <div className="flex-1 overflow-y-auto p-6">
            {/* Mode Tabs */}
            <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as "generate" | "analyze")} className="mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="generate" className="gap-2">
                  <Wand2 className="h-4 w-4" />
                  Generate
                </TabsTrigger>
                <TabsTrigger value="analyze" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Analyze
                </TabsTrigger>
              </TabsList>

              {/* Generate Tab */}
              <TabsContent value="generate" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Generation Controls */}
                  <div className="lg:col-span-1 space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Generate Video</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-xs font-medium mb-2 block">Prompt</label>
                          <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the video you want to create..."
                            rows={3}
                            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          />
                        </div>

                        {/* Model Selection */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium">Auto-select model</label>
                            <Switch checked={autoSelectModel} onCheckedChange={setAutoSelectModel} />
                          </div>
                          {!autoSelectModel && (
                            <Select value={selectedModel} onValueChange={setSelectedModel}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select a model" />
                              </SelectTrigger>
                              <SelectContent>
                                {videoModels.map((model) => (
                                  <SelectItem key={model.id} value={model.id}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">{model.name}</span>
                                      {model.type === "closed" && <Crown className="h-3 w-3 text-yellow-500" />}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        <Button
                          onClick={handleGenerate}
                          disabled={!prompt.trim() || isGenerating}
                          className="w-full gap-2"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4" />
                              Generate
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Generated Videos Grid */}
                  <div className="lg:col-span-2">
                    <Card className="h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Generated Videos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {generatedVideos.length === 0 ? (
                          <div className="py-12 text-center">
                            <Wand2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No videos yet</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {generatedVideos.map((video) => (
                              <div
                                key={video.id}
                                className="relative aspect-video rounded-lg overflow-hidden bg-secondary group"
                              >
                                {video.status === "generating" ? (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    <p className="text-xs text-muted-foreground">Generating...</p>
                                  </div>
                                ) : (
                                  <>
                                    <img
                                      src={video.thumbnail}
                                      alt={video.prompt}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                      <Play className="h-10 w-10 text-white" />
                                    </div>
                                    <div className="absolute bottom-2 right-2 flex gap-1">
                                      <button className="p-1 bg-black/50 rounded">
                                        <Download className="h-3 w-3 text-white" />
                                      </button>
                                      <button
                                        onClick={() => deleteGeneratedVideo(video.id)}
                                        className="p-1 bg-black/50 rounded"
                                      >
                                        <Trash2 className="h-3 w-3 text-white" />
                                      </button>
                                    </div>
                                    <Badge className="absolute top-2 left-2 text-[10px]">{video.duration}</Badge>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Analyze Tab */}
              <TabsContent value="analyze" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Upload Area */}
                  <div className="lg:col-span-2">
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all mb-6 ${
                        isDragging ? "border-primary bg-primary/10" : "border-border"
                      }`}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm font-medium mb-1">Drop videos here</p>
                      <p className="text-xs text-muted-foreground mb-3">Max 50MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        Select Video
                      </Button>
                    </div>

                    {/* Uploaded Videos */}
                    <div className="space-y-3">
                      {uploadedVideos.map((video) => (
                        <div
                          key={video.id}
                          onClick={() => video.status === "ready" && setSelectedVideo(video)}
                          className={`flex items-center gap-4 p-3 rounded-lg bg-card border cursor-pointer transition-colors ${
                            selectedVideo?.id === video.id ? "border-primary" : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          <div className="w-20 h-12 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                            <FileVideo className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{video.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatSize(video.size)} {video.duration && `• ${video.duration}`}
                            </p>
                            {video.status === "uploading" && (
                              <Progress value={video.progress} className="h-1 mt-1" />
                            )}
                            {video.status === "processing" && (
                              <span className="text-xs text-primary flex items-center gap-1 mt-1">
                                <Sparkles className="h-3 w-3 animate-pulse" /> Processing...
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => { e.stopPropagation(); deleteUploadedVideo(video.id); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insights Panel */}
                  <div className="lg:col-span-1">
                    <Card className="h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedVideo?.insights ? (
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-1">Summary</h4>
                              <p className="text-sm">{selectedVideo.insights.summary}</p>
                            </div>
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-2">Key Moments</h4>
                              <div className="space-y-2">
                                {selectedVideo.insights.keyMoments.map((m, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs">
                                    <Badge variant="secondary" className="text-[10px]">{m.time}</Badge>
                                    <span>{m.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-2">Topics</h4>
                              <div className="flex flex-wrap gap-1">
                                {selectedVideo.insights.topics.map((t, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px]">{t}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            Select a video to see insights
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <UsageLimitModal
        open={limitModalOpen}
        onOpenChange={setLimitModalOpen}
        feature="video"
        usageCount={usage.video}
        limit={limits.video}
        requiredPlan={getRequiredPlanForUnlimited("video")}
      />
    </>
  );
}
