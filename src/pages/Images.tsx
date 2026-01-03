import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Image as ImageIcon,
  Upload,
  FileImage,
  Sparkles,
  Type,
  Box,
  Trash2,
  ArrowLeft,
  Loader2,
  Download,
  Share2,
  ZoomIn,
  Copy,
  Eye,
  X,
  Wand2,
  Check,
  Crown,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

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
                <ImageIcon className="h-5 w-5 text-primary" />
                Images
              </h1>
              <p className="text-sm text-muted-foreground">Generate AI images or analyze uploaded images</p>
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
                    <CardTitle className="text-base">Generate Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Prompt</label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the image you want to create..."
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
                          Proxinex will choose the best model based on your prompt
                        </p>
                      ) : (
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            {imageModels.map((model) => (
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
                          Generate Image
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
                    {imageModels.slice(0, 4).map((model) => (
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
                          <p className="text-xs text-muted-foreground">{model.provider}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {model.freeGenerations} free
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Generated Images Grid */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">Generated Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedImages.length === 0 ? (
                      <div className="py-16 text-center">
                        <Wand2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium mb-2">No images yet</h3>
                        <p className="text-sm text-muted-foreground">
                          Enter a prompt and generate your first image
                        </p>
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
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                            ) : (
                              <>
                                <img
                                  src={image.url}
                                  alt={image.prompt}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <p className="text-xs text-white line-clamp-2 mb-2">{image.prompt}</p>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => { setLightboxImage(image.url); setLightboxOpen(true); }}
                                        className="p-1.5 bg-white/20 rounded hover:bg-white/40"
                                      >
                                        <ZoomIn className="h-3 w-3 text-white" />
                                      </button>
                                      <button className="p-1.5 bg-white/20 rounded hover:bg-white/40">
                                        <Download className="h-3 w-3 text-white" />
                                      </button>
                                      <button
                                        onClick={() => deleteGeneratedImage(image.id)}
                                        className="p-1.5 bg-white/20 rounded hover:bg-white/40"
                                      >
                                        <Trash2 className="h-3 w-3 text-white" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <Badge className="absolute top-2 right-2 text-[10px]" variant="secondary">
                                  {image.model}
                                </Badge>
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
              {/* Upload & Image Grid */}
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
                      <h3 className="font-medium mb-2">Upload Images</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag & drop or click to browse
                      </p>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        Select Images
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Your Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {uploadedImages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No images uploaded yet
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {uploadedImages.map((image) => (
                          <div
                            key={image.id}
                            onClick={() => image.status === "ready" && setSelectedImage(image)}
                            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 transition-colors ${
                              selectedImage?.id === image.id
                                ? "border-primary"
                                : "border-transparent hover:border-primary/50"
                            }`}
                          >
                            <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
                            {image.status !== "ready" && (
                              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteUploadedImage(image.id); }}
                                className="p-1 bg-white/20 rounded hover:bg-white/40"
                              >
                                <Trash2 className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Panel */}
              <div className="lg:col-span-2">
                {selectedImage?.analysis ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedImage.url}
                          alt={selectedImage.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div>
                          <CardTitle className="text-base">{selectedImage.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{formatSize(selectedImage.size)}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Description */}
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          AI Description
                        </h4>
                        <p className="text-sm text-muted-foreground">{selectedImage.analysis.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {selectedImage.analysis.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* Objects */}
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Box className="h-4 w-4 text-primary" />
                          Detected Objects
                        </h4>
                        <div className="space-y-2">
                          {selectedImage.analysis.objects.map((obj, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-sm">{obj.name}</span>
                              <div className="flex items-center gap-2">
                                <Progress value={obj.confidence} className="w-20 h-2" />
                                <span className="text-xs text-muted-foreground w-8">{obj.confidence}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Colors */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Color Palette</h4>
                        <div className="flex gap-2">
                          {selectedImage.analysis.colors.map((color, i) => (
                            <button
                              key={i}
                              onClick={() => copyText(color.hex)}
                              className="flex flex-col items-center gap-1 group"
                            >
                              <div
                                className="w-12 h-12 rounded-lg border border-border group-hover:scale-110 transition-transform"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span className="text-[10px] text-muted-foreground">{color.hex}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No image selected</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload and select an image to see analysis
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={lightboxImage} alt="Preview" className="w-full h-auto rounded-lg" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
