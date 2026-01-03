import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
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
  Share2
} from "lucide-react";
import { Link } from "react-router-dom";

interface VideoFile {
  id: string;
  name: string;
  size: number;
  duration?: string;
  thumbnail?: string;
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
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const MAX_SIZE = 50 * 1024 * 1024; // 50MB

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
          description: `${file.name} exceeds the 50MB limit`,
          variant: "destructive",
        });
        continue;
      }

      const videoFile: VideoFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        file,
        status: "uploading",
        progress: 0,
      };

      setVideos(prev => [...prev, videoFile]);

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 100));
        setVideos(prev =>
          prev.map(v =>
            v.id === videoFile.id ? { ...v, progress: i } : v
          )
        );
      }

      // Simulate processing
      setVideos(prev =>
        prev.map(v =>
          v.id === videoFile.id ? { ...v, status: "processing", progress: 0 } : v
        )
      );

      // Simulate AI processing
      await new Promise(r => setTimeout(r, 2000));

      setVideos(prev =>
        prev.map(v =>
          v.id === videoFile.id
            ? {
                ...v,
                status: "ready",
                progress: 100,
                duration: "3:45",
                insights: {
                  summary: "This video discusses key concepts about artificial intelligence and its applications in modern technology. The speaker covers machine learning fundamentals and practical use cases.",
                  transcript: "Welcome to this overview of artificial intelligence. Today we'll explore how AI is transforming various industries... [Full transcript available]",
                  keyMoments: [
                    { time: "0:00", description: "Introduction to AI concepts" },
                    { time: "0:45", description: "Machine learning fundamentals" },
                    { time: "1:30", description: "Real-world applications" },
                    { time: "2:15", description: "Future predictions" },
                    { time: "3:00", description: "Conclusion and key takeaways" },
                  ],
                  topics: ["AI", "Machine Learning", "Technology", "Innovation"],
                },
              }
            : v
        )
      );

      toast({
        title: "Video processed",
        description: `${file.name} has been analyzed successfully`,
      });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const deleteVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    if (selectedVideo?.id === id) setSelectedVideo(null);
    toast({ title: "Video deleted" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/app" className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <VideoIcon className="h-5 w-5 text-primary" />
                Video Analysis
              </h1>
              <p className="text-sm text-muted-foreground">Upload videos up to 50MB for AI-powered insights</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload & Video List */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Zone */}
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
                    Drag & drop or click to browse<br />
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

            {/* Video List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Videos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {videos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No videos uploaded yet
                  </p>
                ) : (
                  videos.map(video => (
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
                        <div className="w-16 h-10 bg-secondary rounded flex items-center justify-center">
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
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); deleteVideo(video.id); }}
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
                {/* Video Player */}
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
                            onClick={() => {
                              videoRef.current?.play();
                              setIsPlaying(true);
                            }}
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
                            if (isPlaying) {
                              videoRef.current?.pause();
                            } else {
                              videoRef.current?.play();
                            }
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

                {/* AI Insights */}
                {selectedVideo.insights && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Summary */}
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

                    {/* Key Moments */}
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

                    {/* Transcript */}
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
                    Upload and select a video to see AI-powered insights
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
