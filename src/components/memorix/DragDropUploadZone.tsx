import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  Mic,
  Video,
  Link as LinkIcon,
  File,
  X,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DragDropUploadZoneProps {
  onFilesDropped: (files: File[], type: "pdf" | "doc" | "audio" | "video") => void;
  onUrlSubmit?: (url: string) => void;
  className?: string;
}

export const DragDropUploadZone = ({
  onFilesDropped,
  onUrlSubmit,
  className,
}: DragDropUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): "pdf" | "doc" | "audio" | "video" => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (ext === "pdf") return "pdf";
    if (["doc", "docx", "txt", "rtf"].includes(ext)) return "doc";
    if (["mp3", "wav", "m4a", "ogg", "flac"].includes(ext)) return "audio";
    if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "video";
    return "doc";
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setIsDragging(false);
      }
      return newCount;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setDragCounter(0);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      setDroppedFiles(files);
      setShowSuccess(true);

      // Group files by type and upload
      const filesByType = new Map<"pdf" | "doc" | "audio" | "video", File[]>();
      files.forEach((file) => {
        const type = getFileType(file);
        if (!filesByType.has(type)) {
          filesByType.set(type, []);
        }
        filesByType.get(type)!.push(file);
      });

      filesByType.forEach((filesOfType, type) => {
        onFilesDropped(filesOfType, type);
      });

      // Reset success state after animation
      setTimeout(() => {
        setShowSuccess(false);
        setDroppedFiles([]);
      }, 2000);
    },
    [onFilesDropped]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setDroppedFiles(files);
    setShowSuccess(true);

    const filesByType = new Map<"pdf" | "doc" | "audio" | "video", File[]>();
    files.forEach((file) => {
      const type = getFileType(file);
      if (!filesByType.has(type)) {
        filesByType.set(type, []);
      }
      filesByType.get(type)!.push(file);
    });

    filesByType.forEach((filesOfType, type) => {
      onFilesDropped(filesOfType, type);
    });

    setTimeout(() => {
      setShowSuccess(false);
      setDroppedFiles([]);
    }, 2000);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden",
        isDragging
          ? "border-primary bg-primary/10 scale-[1.02]"
          : showSuccess
          ? "border-green-500 bg-green-500/10"
          : "border-border hover:border-primary/50 hover:bg-primary/5",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.rtf,.mp3,.wav,.m4a,.mp4,.webm,.mov"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Glowing border effect when dragging */}
      {isDragging && (
        <div className="absolute inset-0 rounded-xl animate-pulse bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />
      )}

      <div className="relative p-8 flex flex-col items-center justify-center gap-4 cursor-pointer">
        {showSuccess ? (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-green-500">
                {droppedFiles.length} file{droppedFiles.length > 1 ? "s" : ""} uploading!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Processing will begin shortly...
              </p>
            </div>
          </>
        ) : isDragging ? (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm font-medium text-primary">Drop files here!</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Drag & drop files here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span>PDF/Doc</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Mic className="h-3 w-3" />
                <span>Audio</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Video className="h-3 w-3" />
                <span>Video</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
