import { useState } from "react";
import { FileText, Image, Video, File, Download, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface FileAttachmentDisplayProps {
  files: FileAttachment[];
  className?: string;
}

export const FileAttachmentDisplay = ({ files, className = "" }: FileAttachmentDisplayProps) => {
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);

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

  const handleDownload = (file: FileAttachment) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canPreview = (type: string) => {
    return type.startsWith("image/") || type.startsWith("video/") || type.includes("pdf");
  };

  return (
    <>
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {files.map((file) => {
          const FileIcon = getFileIcon(file.type);
          const isImage = file.type.startsWith("image/");
          const isVideo = file.type.startsWith("video/");

          return (
            <div
              key={file.id}
              className="group relative flex items-center gap-2 bg-secondary/50 border border-border rounded-lg p-2 pr-3 hover:bg-secondary/80 transition-colors"
            >
              {/* Thumbnail or Icon */}
              {isImage ? (
                <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-muted">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate max-w-[120px]">
                  {file.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {canPreview(file.type) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setPreviewFile(file)}
                    title="Preview"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleDownload(file)}
                  title="Download"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="truncate">{previewFile?.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => previewFile && handleDownload(previewFile)}
                className="ml-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg min-h-[300px]">
            {previewFile?.type.startsWith("image/") && (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            )}
            {previewFile?.type.startsWith("video/") && (
              <video
                src={previewFile.url}
                controls
                className="max-w-full max-h-[70vh] rounded"
              />
            )}
            {previewFile?.type.includes("pdf") && (
              <iframe
                src={previewFile.url}
                className="w-full h-[70vh] rounded"
                title={previewFile.name}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Inline preview for images in chat (smaller, click to expand)
export const InlineImagePreview = ({ files }: { files: FileAttachment[] }) => {
  const [expandedImage, setExpandedImage] = useState<FileAttachment | null>(null);
  const images = files.filter((f) => f.type.startsWith("image/"));

  if (images.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-2">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => setExpandedImage(image)}
            className="relative group rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
          >
            <img
              src={image.url}
              alt={image.name}
              className="w-24 h-24 object-cover"
            />
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Eye className="h-5 w-5 text-foreground" />
            </div>
          </button>
        ))}
      </div>

      {/* Expanded Image Dialog */}
      <Dialog open={!!expandedImage} onOpenChange={() => setExpandedImage(null)}>
        <DialogContent className="max-w-5xl max-h-[95vh] p-2">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-background/80"
              onClick={() => setExpandedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            {expandedImage && (
              <img
                src={expandedImage.url}
                alt={expandedImage.name}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
