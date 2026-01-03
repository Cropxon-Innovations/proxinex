import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MessageSquare, Search, Pin, MoreHorizontal, Pencil, Share2, Archive, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pinColors, PinColor } from "@/components/chat/PinColorSelector";

interface DraggablePinnedSessionProps {
  session: {
    id: string;
    title: string;
    isPinned?: boolean;
    isResearch?: boolean;
    pinColor?: PinColor;
  };
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename?: (id: string, title: string) => void;
  onPin?: (id: string) => void;
  onShare?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function DraggablePinnedSession({
  session,
  isActive,
  onSelect,
  onRename,
  onPin,
  onShare,
  onArchive,
  onDelete,
}: DraggablePinnedSessionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: session.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const pinColor = session.pinColor || "primary";
  const colorConfig = pinColors.find((c) => c.id === pinColor) || pinColors[0];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1 w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      } ${isDragging ? "z-50 shadow-lg" : ""}`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-0.5 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </button>

      {/* Session Info */}
      <button
        onClick={() => onSelect(session.id)}
        className="flex items-center gap-2 flex-1 min-w-0"
      >
        {session.isResearch ? (
          <Search className="h-3 w-3 flex-shrink-0" />
        ) : (
          <MessageSquare className="h-3 w-3 flex-shrink-0" />
        )}
        <span className="truncate flex-1">{session.title.slice(0, 18)}{session.title.length > 18 ? "..." : ""}</span>
      </button>

      {/* Colored Pin Icon */}
      {session.isPinned && (
        <Pin className={`h-3 w-3 flex-shrink-0 ${colorConfig.text} ${colorConfig.fill}`} />
      )}

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-secondary rounded transition-opacity">
            <MoreHorizontal className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={() => onRename?.(session.id, session.title)}>
            <Pencil className="h-3 w-3 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPin?.(session.id)}>
            <Pin className={`h-3 w-3 mr-2 ${session.isPinned ? colorConfig.fill + " " + colorConfig.text : ""}`} />
            {session.isPinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onShare?.(session.id)}>
            <Share2 className="h-3 w-3 mr-2" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onArchive?.(session.id)}>
            <Archive className="h-3 w-3 mr-2" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onDelete?.(session.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
