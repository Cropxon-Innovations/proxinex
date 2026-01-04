import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useHistoryData } from "@/hooks/useHistoryData";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { UsageLimitModal } from "@/components/UsageLimitModal";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Image as ImageIcon,
  Upload,
  Sparkles,
  Trash2,
  Loader2,
  Download,
  ZoomIn,
  Copy,
  X,
  Wand2,
  Crown,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Helmet } from "react-helmet-async";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ImageModel {
  id: string;
  name: string;
  provider: string;
  type: "open" | "closed";
  quality: "standard" | "premium";
  speed: "fast" | "medium" | "slow";
  freeGenerations: number;
}

const imageModels: ImageModel[] = [
  { id: "flux-schnell", name: "FLUX Schnell", provider: "Black Forest Labs", type: "open", quality: "standard", speed: "fast", freeGenerations: 50 },
  { id: "flux-dev", name: "FLUX Dev", provider: "Black Forest Labs", type: "open", quality: "premium", speed: "medium", freeGenerations: 20 },
  { id: "sdxl-turbo", name: "SDXL Turbo", provider: "Stability AI", type: "open", quality: "standard", speed: "fast", freeGenerations: 100 },
  { id: "dall-e-3", name: "DALL-E 3", provider: "OpenAI", type: "closed", quality: "premium", speed: "medium", freeGenerations: 10 },
  { id: "midjourney-v6", name: "Midjourney V6", provider: "Midjourney", type: "closed", quality: "premium", speed: "slow", freeGenerations: 5 },
  { id: "stable-diffusion-3", name: "Stable Diffusion 3", provider: "Stability AI", type: "closed", quality: "premium", speed: "medium", freeGenerations: 15 },
];

interface GeneratedImage {
  id: string;
  prompt: string;
  model: string;
  url: string;
  status: "generating" | "ready" | "error";
  createdAt: Date;
}

interface UploadedImage {
  id: string;
  name: string;
  size: number;
  url: string;
  file: File;
  status: "uploading" | "processing" | "ready" | "error";
  progress: number;
  analysis?: {
    description: string;
    objects: { name: string; confidence: number }[];
    text: string[];
    colors: { hex: string; name: string; percentage: number }[];
    tags: string[];
  };
}

export default function ImagesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMode, setActiveMode] = useState<"generate" | "analyze">("generate");
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("flux-schnell");
  const [autoSelectModel, setAutoSelectModel] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string>("");
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Check usage limits
    if (!canUseFeature("images")) {
      setLimitModalOpen(true);
      return;
    }

    // Increment usage
    const success = await incrementUsage("images");
    if (!success) {
      setLimitModalOpen(true);
      return;
    }

    setIsGenerating(true);
    const modelToUse = autoSelectModel ? "gemini-flash" : selectedModel;
    const model = imageModels.find(m => m.id === modelToUse) || { name: "Gemini 2.5 Flash Image" };

    const newImage: GeneratedImage = {
      id: Math.random().toString(36).substr(2, 9),
      prompt: prompt.trim(),
      model: model.name,
      url: "",
      status: "generating",
      createdAt: new Date(),
    };

    setGeneratedImages(prev => [newImage, ...prev]);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt: prompt.trim(), aspectRatio: "1:1" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = await response.json();

      setGeneratedImages(prev =>
        prev.map(img =>
          img.id === newImage.id
            ? { ...img, status: "ready" as const, url: data.imageUrl }
            : img
        )
      );

      toast({ title: "Image generated", description: `Created with ${model.name}` });
    } catch (error) {
      setGeneratedImages(prev =>
        prev.map(img =>
          img.id === newImage.id
            ? { ...img, status: "error" as const }
            : img
        )
      );
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setPrompt("");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    processFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
      processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      const imageFile: UploadedImage = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        file,
        status: "uploading",
        progress: 0,
      };

      setUploadedImages(prev => [...prev, imageFile]);

      for (let i = 0; i <= 100; i += 20) {
        await new Promise(r => setTimeout(r, 50));
        setUploadedImages(prev =>
          prev.map(img => (img.id === imageFile.id ? { ...img, progress: i } : img))
        );
      }

      setUploadedImages(prev =>
        prev.map(img => (img.id === imageFile.id ? { ...img, status: "processing", progress: 0 } : img))
      );

      await new Promise(r => setTimeout(r, 1500));

      setUploadedImages(prev =>
        prev.map(img =>
          img.id === imageFile.id
            ? {
                ...img,
                status: "ready",
                progress: 100,
                analysis: {
                  description: "A high-quality photograph with rich detail and professional composition.",
                  objects: [
                    { name: "Primary Subject", confidence: 95 },
                    { name: "Background Element", confidence: 87 },
                    { name: "Detail", confidence: 78 },
                  ],
                  text: ["Sample Text", "Detected Label"],
                  colors: [
                    { hex: "#2D3748", name: "Dark Gray", percentage: 35 },
                    { hex: "#E2E8F0", name: "Light Gray", percentage: 30 },
                    { hex: "#48BB78", name: "Green", percentage: 20 },
                    { hex: "#F7FAFC", name: "White", percentage: 15 },
                  ],
                  tags: ["photo", "high-quality", "professional"],
                },
              }
            : img
        )
      );

      toast({ title: "Image analyzed", description: `${file.name} processed` });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const deleteUploadedImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
    if (selectedImage?.id === id) setSelectedImage(null);
  };

  const deleteGeneratedImage = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <>
      <Helmet>
        <title>Images - Proxinex</title>
        <meta name="description" content="Generate and analyze images with AI" />
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
          <header className="h-14 border-b border-border flex items-center justify-between px-6 flex-shrink-0 bg-background">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ImageIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground text-sm">Images</h1>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Generate or analyze images with AI</span>
                  {limits.images !== Infinity && (
                    <Badge variant="secondary" className="text-[10px] h-4">
                      {getUsageDisplay("images")} used
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <ThemeToggle />
          </header>

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
                        <CardTitle className="text-sm">Generate Image</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-xs font-medium mb-2 block">Prompt</label>
                          <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the image you want to create..."
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
                                {imageModels.map((model) => (
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

                  {/* Generated Images Grid */}
                  <div className="lg:col-span-2">
                    <Card className="h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Generated Images</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {generatedImages.length === 0 ? (
                          <div className="py-12 text-center">
                            <Wand2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No images yet</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {generatedImages.map((image) => (
                              <div
                                key={image.id}
                                className="relative aspect-square rounded-lg overflow-hidden bg-secondary group"
                              >
                                {image.status === "generating" ? (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                  </div>
                                ) : (
                                  <>
                                    <img
                                      src={image.url}
                                      alt={image.prompt}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="absolute bottom-0 left-0 right-0 p-2">
                                        <p className="text-[10px] text-white line-clamp-2 mb-1">{image.prompt}</p>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => { setLightboxImage(image.url); setLightboxOpen(true); }}
                                            className="p-1 bg-white/20 rounded hover:bg-white/40"
                                          >
                                            <ZoomIn className="h-3 w-3 text-white" />
                                          </button>
                                          <button className="p-1 bg-white/20 rounded hover:bg-white/40">
                                            <Download className="h-3 w-3 text-white" />
                                          </button>
                                          <button
                                            onClick={() => deleteGeneratedImage(image.id)}
                                            className="p-1 bg-white/20 rounded hover:bg-white/40"
                                          >
                                            <Trash2 className="h-3 w-3 text-white" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
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
                      <p className="text-sm font-medium mb-1">Drop images here</p>
                      <p className="text-xs text-muted-foreground mb-3">or click to upload</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        Select Files
                      </Button>
                    </div>

                    {/* Uploaded Images Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {uploadedImages.map((img) => (
                        <div
                          key={img.id}
                          onClick={() => img.status === "ready" && setSelectedImage(img)}
                          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
                            selectedImage?.id === img.id ? "ring-2 ring-primary" : ""
                          }`}
                        >
                          <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                          {img.status === "uploading" && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                              <Progress value={img.progress} className="w-3/4 h-1" />
                            </div>
                          )}
                          {img.status === "processing" && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                            </div>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteUploadedImage(img.id); }}
                            className="absolute top-2 right-2 p-1 bg-background/80 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Analysis Panel */}
                  <div className="lg:col-span-1">
                    <Card className="h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedImage?.analysis ? (
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-1">Description</h4>
                              <p className="text-sm">{selectedImage.analysis.description}</p>
                            </div>
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-2">Objects</h4>
                              <div className="space-y-1">
                                {selectedImage.analysis.objects.map((obj, i) => (
                                  <div key={i} className="flex justify-between text-xs">
                                    <span>{obj.name}</span>
                                    <span className="text-muted-foreground">{obj.confidence}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-2">Colors</h4>
                              <div className="flex gap-1">
                                {selectedImage.analysis.colors.map((c, i) => (
                                  <div
                                    key={i}
                                    className="w-6 h-6 rounded cursor-pointer"
                                    style={{ backgroundColor: c.hex }}
                                    title={`${c.name} (${c.percentage}%)`}
                                    onClick={() => copyText(c.hex)}
                                  />
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-2">Tags</h4>
                              <div className="flex flex-wrap gap-1">
                                {selectedImage.analysis.tags.map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-[10px]">{tag}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            Select an image to see analysis
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

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          <img src={lightboxImage} alt="Preview" className="w-full h-auto rounded-lg" />
        </DialogContent>
      </Dialog>

      <UsageLimitModal
        open={limitModalOpen}
        onOpenChange={setLimitModalOpen}
        feature="images"
        usageCount={usage.images}
        limit={limits.images}
        requiredPlan={getRequiredPlanForUnlimited("images")}
      />
    </>
  );
}
