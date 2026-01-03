import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ArrowLeft,
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
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VideoModel {
  id: string;
  name: string;
  provider: string;
  type: "open" | "closed";
  quality: "standard" | "premium";
  maxDuration: number; // seconds
  freeGenerations: number;
}

const videoModels: VideoModel[] = [
  { id: "runway-gen3", name: "Runway Gen-3 Alpha", provider: "Runway", type: "closed", quality: "premium", maxDuration: 10, freeGenerations: 3 },
  { id: "pika-1.0", name: "Pika 1.0", provider: "Pika Labs", type: "closed", quality: "premium", maxDuration: 4, freeGenerations: 5 },
  { id: "stable-video", name: "Stable Video Diffusion", provider: "Stability AI", type: "open", quality: "standard", maxDuration: 4, freeGenerations: 10 },
  { id: "kling-1.5", name: "Kling 1.5", provider: "Kuaishou", type: "closed", quality: "premium", maxDuration: 10, freeGenerations: 2 },
  { id: "minimax", name: "Minimax Video", provider: "MiniMax", type: "closed", quality: "standard", maxDuration: 6, freeGenerations: 5 },
  { id: "haiper", name: "Haiper 2.0", provider: "Haiper", type: "open", quality: "standard", maxDuration: 4, freeGenerations: 20 },
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
  const [activeMode, setActiveMode] = useState<"generate" | "analyze">("generate");
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("stable-video");
  const [autoSelectModel, setAutoSelectModel] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<UploadedVideo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const MAX_SIZE = 50 * 1024 * 1024; // 50MB

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    const modelToUse = autoSelectModel ? "stable-video" : selectedModel;
    const model = videoModels.find(m => m.id === modelToUse);

    const newVideo: GeneratedVideo = {
      id: Math.random().toString(36).substr(2, 9),
      prompt: prompt.trim(),
      model: model?.name || modelToUse,
      url: "",
      thumbnail: "",
      status: "generating",
      duration: `${model?.maxDuration || 4}s`,
      createdAt: new Date(),
    };

    setGeneratedVideos(prev => [newVideo, ...prev]);

    // Simulate generation (longer for video)
    await new Promise(r => setTimeout(r, 4000 + Math.random() * 3000));

    // Use placeholder
    const placeholderUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    const thumbnailUrl = `https://picsum.photos/seed/${newVideo.id}/640/360`;

    setGeneratedVideos(prev =>
      prev.map(vid =>
        vid.id === newVideo.id
          ? { ...vid, status: "ready" as const, url: placeholderUrl, thumbnail: thumbnailUrl }
          : vid
      )
    );

    setIsGenerating(false);
    setPrompt("");
    toast({ title: "Video generated", description: `Created with ${model?.name}` });
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
                  summary: "This video discusses key concepts with clear explanations and visual examples.",
                  transcript: "Welcome to this overview. Today we'll explore important topics... [Full transcript available]",
                  keyMoments: [
                    { time: "0:00", description: "Introduction" },
                    { time: "0:45", description: "Main topic begins" },
                    { time: "1:30", description: "Key demonstration" },
                    { time: "2:15", description: "Summary points" },
                    { time: "3:00", description: "Conclusion" },
                  ],
                  topics: ["Overview", "Demonstration", "Tutorial"],
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/app" className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <VideoIcon className="h-5 w-5 text-primary" />
                Video
              </h1>
              <p className="text-sm text-muted-foreground">Generate AI videos or analyze uploaded videos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
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
                  <CardHeader>
                    <CardTitle className="text-base">Generate Video</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Prompt</label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the video you want to create..."
                        rows={4}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Auto-select model</label>
                        <Switch checked={autoSelectModel} onCheckedChange={setAutoSelectModel} />
                      </div>
                      {autoSelectModel ? (
                        <p className="text-xs text-muted-foreground">
                          Proxinex will choose the best model for your prompt
                        </p>
                      ) : (
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            {videoModels.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                <div className="flex items-center gap-2">
                                  <span>{model.name}</span>
                                  {model.type === "closed" && <Crown className="h-3 w-3 text-yellow-500" />}
                                  {model.quality === "premium" && <Zap className="h-3 w-3 text-primary" />}
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
                          Generate Video
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Models Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Available Models</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {videoModels.slice(0, 4).map((model) => (
                      <div
                        key={model.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{model.name}</span>
                            {model.type === "closed" ? (
                              <Badge variant="outline" className="text-xs">Pro</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Open</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {model.provider} • Up to {model.maxDuration}s
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {model.freeGenerations} free
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Generated Videos Grid */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">Generated Videos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedVideos.length === 0 ? (
                      <div className="py-16 text-center">
                        <Wand2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium mb-2">No videos yet</h3>
                        <p className="text-sm text-muted-foreground">
                          Enter a prompt and generate your first video
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {generatedVideos.map((video) => (
                          <div
                            key={video.id}
                            className="relative aspect-video rounded-lg overflow-hidden bg-secondary group"
                          >
                            {video.status === "generating" ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Generating video...</p>
                              </div>
                            ) : (
                              <>
                                <img
                                  src={video.thumbnail}
                                  alt={video.prompt}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <button className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors">
                                    <Play className="h-6 w-6 text-primary-foreground ml-1" />
                                  </button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80">
                                  <p className="text-xs text-white line-clamp-1 mb-1">{video.prompt}</p>
                                  <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="text-[10px]">{video.model}</Badge>
                                    <span className="text-[10px] text-white/80">{video.duration}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteGeneratedVideo(video.id)}
                                  className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-3 w-3 text-white" />
                                </button>
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
              {/* Upload & Video List */}
              <div className="lg:col-span-1 space-y-6">
                <Card
                  className={`transition-colors ${isDragging ? "border-primary bg-primary/5" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <CardContent className="p-6">
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">Upload Videos</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag & drop or browse<br />
                        <span className="text-xs">Max 50MB per file</span>
                      </p>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        Select Videos
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Your Videos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {uploadedVideos.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No videos uploaded yet
                      </p>
                    ) : (
                      uploadedVideos.map((video) => (
                        <div
                          key={video.id}
                          onClick={() => video.status === "ready" && setSelectedVideo(video)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedVideo?.id === video.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-secondary"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-10 bg-secondary rounded flex items-center justify-center shrink-0">
                              <FileVideo className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{video.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{formatSize(video.size)}</span>
                                {video.duration && (
                                  <>
                                    <span>•</span>
                                    <span>{video.duration}</span>
                                  </>
                                )}
                              </div>
                              {video.status === "uploading" && (
                                <Progress value={video.progress} className="h-1 mt-2" />
                              )}
                              {video.status === "processing" && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Processing...
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={(e) => { e.stopPropagation(); deleteUploadedVideo(video.id); }}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Video Player & Insights */}
              <div className="lg:col-span-2 space-y-6">
                {selectedVideo ? (
                  <>
                    <Card>
                      <CardContent className="p-0">
                        <div className="aspect-video bg-black rounded-t-lg relative overflow-hidden">
                          <video
                            ref={videoRef}
                            src={URL.createObjectURL(selectedVideo.file)}
                            className="w-full h-full object-contain"
                            onClick={() => {
                              if (videoRef.current?.paused) {
                                videoRef.current.play();
                                setIsPlaying(true);
                              } else {
                                videoRef.current?.pause();
                                setIsPlaying(false);
                              }
                            }}
                          />
                          {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <button
                                onClick={() => { videoRef.current?.play(); setIsPlaying(true); }}
                                className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors"
                              >
                                <Play className="h-8 w-8 text-primary-foreground ml-1" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <SkipBack className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                if (isPlaying) videoRef.current?.pause();
                                else videoRef.current?.play();
                                setIsPlaying(!isPlaying);
                              }}
                            >
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <SkipForward className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Volume2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Maximize2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {selectedVideo.insights && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              AI Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {selectedVideo.insights.summary}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                              {selectedVideo.insights.topics.map((topic, i) => (
                                <Badge key={i} variant="secondary">{topic}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <List className="h-4 w-4 text-primary" />
                              Key Moments
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {selectedVideo.insights.keyMoments.map((moment, i) => (
                              <button
                                key={i}
                                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left"
                              >
                                <Badge variant="outline" className="shrink-0">{moment.time}</Badge>
                                <span className="text-sm">{moment.description}</span>
                              </button>
                            ))}
                          </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-primary" />
                              Transcript
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {selectedVideo.insights.transcript}
                            </p>
                            <Button variant="outline" size="sm" className="mt-4">
                              <Download className="h-4 w-4 mr-2" />
                              Download Full Transcript
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </>
                ) : (
                  <Card className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <VideoIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No video selected</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload and select a video to see insights
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
