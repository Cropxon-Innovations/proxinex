import { useState } from "react";
import {
  Share,
  Pencil,
  FolderOpen,
  Trash2,
  Archive,
  Pin,
  MoreVertical,
  Copy,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ChatActionsMenuProps {
  sessionId: string;
  sessionTitle: string;
  isPinned?: boolean;
  isArchived?: boolean;
  onRename: (sessionId: string, newTitle: string) => void;
  onPin: (sessionId: string) => void;
  onArchive: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onShare?: (sessionId: string) => void;
  onExport?: (sessionId: string) => void;
}

export const ChatActionsMenu = ({
  sessionId,
  sessionTitle,
  isPinned = false,
  isArchived = false,
  onRename,
  onPin,
  onArchive,
  onDelete,
  onShare,
  onExport,
}: ChatActionsMenuProps) => {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(sessionTitle);

  const handleRename = () => {
    if (newTitle.trim()) {
      onRename(sessionId, newTitle.trim());
      setRenameDialogOpen(false);
      toast.success("Chat renamed");
    }
  };

  const handleShare = () => {
    // Copy shareable link to clipboard
    const shareUrl = `${window.location.origin}/shared/chat/${sessionId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard");
    onShare?.(sessionId);
  };

  const handleDelete = () => {
    onDelete(sessionId);
    setDeleteDialogOpen(false);
    toast.success("Chat deleted");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleShare}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => {
            setNewTitle(sessionTitle);
            setRenameDialogOpen(true);
          }}>
            <Pencil className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onPin(sessionId)}>
            <Pin className={`h-4 w-4 mr-2 ${isPinned ? "fill-current text-primary" : ""}`} />
            {isPinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onExport?.(sessionId)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => onArchive(sessionId)}>
            <Archive className={`h-4 w-4 mr-2 ${isArchived ? "text-amber-500" : ""}`} />
            {isArchived ? "Unarchive" : "Archive"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for this chat session
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Chat name..."
            className="mt-2"
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{sessionTitle}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
