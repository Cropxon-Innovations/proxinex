import { useState } from "react";
import { X, FileText, Image, Video, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: "uploading" | "complete" | "error";
  url?: string;
}

interface FileUploadPreviewProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  maxFiles?: number;
}

export const FileUploadPreview = ({ files, onRemove, maxFiles = 10 }: FileUploadPreviewProps) => {
  if (files.length === 0) return null;

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    if (type.startsWith("video/")) return Video;
    if (type.includes("pdf") || type.includes("document")) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="border border-border rounded-lg bg-secondary/30 p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-foreground">
          Attachments ({files.length}/{maxFiles})
        </span>
        {files.length >= maxFiles && (
          <span className="text-xs text-destructive">Max files reached</span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {files.map((uploadedFile) => {
          const FileIcon = getFileIcon(uploadedFile.file.type);
          const isImage = uploadedFile.file.type.startsWith("image/");
          
          return (
            <div
              key={uploadedFile.id}
              className="relative group bg-card border border-border rounded-lg overflow-hidden"
            >
              {/* Preview */}
              <div className="aspect-square flex items-center justify-center bg-secondary/50">
                {isImage && uploadedFile.preview ? (
                  <img
                    src={uploadedFile.preview}
                    alt={uploadedFile.file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileIcon className="h-8 w-8 text-muted-foreground" />
                )}
                
                {/* Upload Progress Overlay */}
                {uploadedFile.status === "uploading" && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                    <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
                    <Progress value={uploadedFile.progress} className="w-3/4 h-1" />
                    <span className="text-xs text-muted-foreground mt-1">
                      {uploadedFile.progress}%
                    </span>
                  </div>
                )}
                
                {/* Error Overlay */}
                {uploadedFile.status === "error" && (
                  <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                    <span className="text-xs text-destructive font-medium">Failed</span>
                  </div>
                )}
              </div>
              
              {/* File Info */}
              <div className="p-2">
                <p className="text-xs font-medium truncate text-foreground">
                  {uploadedFile.file.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatFileSize(uploadedFile.file.size)}
                </p>
              </div>
              
              {/* Remove Button */}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(uploadedFile.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
