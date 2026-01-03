import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface ImageFile {
  id: string;
  name: string;
  size: number;
  url: string;
  file: File;
  status: "uploading" | "processing" | "ready" | "error";
  progress: number;
  analysis?: {
    description: string;
    objects: { name: string; confidence: number; bbox?: { x: number; y: number; w: number; h: number } }[];
    text: string[];
    colors: { hex: string; name: string; percentage: number }[];
    tags: string[];
  };
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      const imageFile: ImageFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        file,
        status: "uploading",
        progress: 0,
      };

      setImages(prev => [...prev, imageFile]);

      // Simulate upload
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(r => setTimeout(r, 50));
        setImages(prev =>
          prev.map(img =>
            img.id === imageFile.id ? { ...img, progress: i } : img
          )
        );
      }

      // Simulate processing
      setImages(prev =>
        prev.map(img =>
          img.id === imageFile.id ? { ...img, status: "processing", progress: 0 } : img
        )
      );

      await new Promise(r => setTimeout(r, 1500));

      // Simulate AI analysis results
      setImages(prev =>
        prev.map(img =>
          img.id === imageFile.id
            ? {
                ...img,
                status: "ready",
                progress: 100,
                analysis: {
                  description: "A high-quality photograph showing a modern workspace with technology devices. The image contains a laptop, smartphone, and various office supplies arranged on a wooden desk with natural lighting from a nearby window.",
                  objects: [
                    { name: "Laptop", confidence: 98 },
                    { name: "Smartphone", confidence: 95 },
                    { name: "Desk", confidence: 92 },
                    { name: "Window", confidence: 87 },
                    { name: "Plant", confidence: 78 },
                    { name: "Coffee Cup", confidence: 75 },
                  ],
                  text: [
                    "MacBook Pro",
                    "Hello World",
                    "Product Design",
                  ],
                  colors: [
                    { hex: "#2D3748", name: "Charcoal", percentage: 35 },
                    { hex: "#E2E8F0", name: "Light Gray", percentage: 25 },
                    { hex: "#48BB78", name: "Green", percentage: 15 },
                    { hex: "#F7FAFC", name: "White", percentage: 25 },
                  ],
                  tags: ["workspace", "technology", "office", "modern", "productivity"],
                },
              }
            : img
        )
      );

      toast({
        title: "Image analyzed",
        description: `${file.name} has been processed successfully`,
      });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedImage?.id === id) setSelectedImage(null);
    toast({ title: "Image deleted" });
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
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
                <ImageIcon className="h-5 w-5 text-primary" />
                Image Analysis
              </h1>
              <p className="text-sm text-muted-foreground">Upload images for AI-powered analysis, OCR, and object detection</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload & Image Grid */}
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
                  <h3 className="font-medium mb-2">Upload Images</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag & drop or click to browse<br />
                    <span className="text-xs">PNG, JPG, WEBP, GIF</span>
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

            {/* Image Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Images</CardTitle>
              </CardHeader>
              <CardContent>
                {images.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No images uploaded yet
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {images.map(image => (
                      <div
                        key={image.id}
                        onClick={() => image.status === "ready" && setSelectedImage(image)}
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 transition-colors ${
                          selectedImage?.id === image.id
                            ? "border-primary"
                            : "border-transparent hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                        {image.status !== "ready" && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedImage(image); setLightboxOpen(true); }}
                              className="p-1 bg-white/20 rounded hover:bg-white/40"
                            >
                              <ZoomIn className="h-4 w-4 text-white" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteImage(image.id); }}
                              className="p-1 bg-white/20 rounded hover:bg-white/40"
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </button>
                          </div>
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
            {selectedImage ? (
              <div className="space-y-6">
                {/* Image Preview */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div
                        className="w-48 h-48 rounded-lg overflow-hidden cursor-pointer shrink-0"
                        onClick={() => setLightboxOpen(true)}
                      >
                        <img
                          src={selectedImage.url}
                          alt={selectedImage.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-2">{selectedImage.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{formatSize(selectedImage.size)}</p>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Ask Proxinex
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Tabs */}
                {selectedImage.analysis && (
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="analysis" className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Analysis
                      </TabsTrigger>
                      <TabsTrigger value="objects" className="flex items-center gap-2">
                        <Box className="h-4 w-4" />
                        Objects
                      </TabsTrigger>
                      <TabsTrigger value="text" className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Text (OCR)
                      </TabsTrigger>
                      <TabsTrigger value="colors" className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-accent" />
                        Colors
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="analysis" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            AI Description
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedImage.analysis.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedImage.analysis.tags.map((tag, i) => (
                              <Badge key={i} variant="secondary">{tag}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="objects" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Box className="h-4 w-4 text-primary" />
                            Detected Objects
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {selectedImage.analysis.objects.map((obj, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-sm font-medium">{obj.name}</span>
                              <div className="flex items-center gap-2">
                                <Progress value={obj.confidence} className="w-24 h-2" />
                                <span className="text-xs text-muted-foreground w-10">{obj.confidence}%</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="text" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Type className="h-4 w-4 text-primary" />
                            Extracted Text (OCR)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedImage.analysis.text.length > 0 ? (
                            <div className="space-y-2">
                              {selectedImage.analysis.text.map((text, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                                >
                                  <span className="text-sm">{text}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => copyText(text)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button variant="outline" className="w-full mt-4" onClick={() => copyText(selectedImage.analysis!.text.join("\n"))}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy All Text
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No text detected in this image
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="colors" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            Color Palette
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedImage.analysis.colors.map((color, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg border border-border"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">{color.name}</span>
                                    <button
                                      onClick={() => copyText(color.hex)}
                                      className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                      {color.hex}
                                    </button>
                                  </div>
                                  <Progress value={color.percentage} className="h-2" />
                                </div>
                                <span className="text-xs text-muted-foreground w-10">{color.percentage}%</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No image selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload and select an image to see AI-powered analysis
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
