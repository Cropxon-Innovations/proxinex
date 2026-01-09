import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHistoryData } from "@/hooks/useHistoryData";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { PinColorPickerDialog } from "@/components/chat/PinColorPickerDialog";
import { pinColors, PinColor } from "@/components/chat/PinColorSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Search,
  Trash2,
  Loader2,
  MoreHorizontal,
  Pencil,
  Pin,
  Share2,
  Archive,
  MessageSquare,
  Calendar,
  Filter,
  CheckSquare,
  XSquare,
  ExternalLink,
  Quote,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { AppHeader } from "@/components/AppHeader";

interface InlineAsk {
  id: string;
  highlighted_text: string;
  question: string;
  answer: string | null;
  created_at: string;
  session_id: string | null;
  conversation_history: any[];
  is_pinned?: boolean;
  is_archived?: boolean;
  pin_color?: PinColor;
  title?: string;
}

const InlineAsksPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inlineAsks, setInlineAsks] = useState<InlineAsk[]>([]);
  const [filteredAsks, setFilteredAsks] = useState<InlineAsk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pinned" | "archived">("all");
  const [selectedAsks, setSelectedAsks] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameQuestion, setRenameQuestion] = useState("");
  const [pinColorOpen, setPinColorOpen] = useState(false);
  const [pendingPinId, setPendingPinId] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    chatSessions,
    inlineAsks: sidebarInlineAsks,
    handlePinSession,
    handleArchiveSession,
    handleDeleteSession,
    handleRenameSession,
    handleReorderPinnedSessions,
    handlePinInlineAsk: sidebarPinInlineAsk,
    handleArchiveInlineAsk: sidebarArchiveInlineAsk,
    handleDeleteInlineAsk: sidebarDeleteInlineAsk,
    handleRenameInlineAsk: sidebarRenameInlineAsk,
  } = useHistoryData();

  useEffect(() => {
    if (user) fetchInlineAsks();
  }, [user]);

  useEffect(() => {
    let result = inlineAsks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (ask) =>
          ask.highlighted_text.toLowerCase().includes(query) ||
          ask.question.toLowerCase().includes(query) ||
          (ask.answer && ask.answer.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (filterType === "pinned") {
      result = result.filter((ask) => ask.is_pinned);
    } else if (filterType === "archived") {
      result = result.filter((ask) => ask.is_archived);
    }

    setFilteredAsks(result);
  }, [inlineAsks, searchQuery, filterType]);

  const fetchInlineAsks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("inline_asks")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load inline asks", variant: "destructive" });
    } else {
      setInlineAsks(
        (data || []).map((ask) => ({
          ...ask,
          conversation_history: Array.isArray(ask.conversation_history) ? ask.conversation_history : [],
          is_pinned: ask.is_pinned ?? false,
          is_archived: ask.is_archived ?? false,
          pin_color: (ask.pin_color as PinColor) || "primary",
          title: ask.title ?? undefined,
        }))
      );
    }
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("inline_asks").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      setInlineAsks((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Deleted" });
    }
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedAsks);
    const { error } = await supabase.from("inline_asks").delete().in("id", ids);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      setInlineAsks((prev) => prev.filter((a) => !ids.includes(a.id)));
      setSelectedAsks(new Set());
      toast({ title: `Deleted ${ids.length} inline asks` });
    }
    setBulkDeleteDialogOpen(false);
  };

  const handleRename = async () => {
    if (!renameId || !renameQuestion.trim()) return;
    const { error } = await supabase
      .from("inline_asks")
      .update({ question: renameQuestion })
      .eq("id", renameId);

    if (error) {
      toast({ title: "Error", description: "Failed to rename", variant: "destructive" });
    } else {
      setInlineAsks((prev) =>
        prev.map((a) => (a.id === renameId ? { ...a, question: renameQuestion } : a))
      );
      toast({ title: "Renamed" });
    }
    setRenameDialogOpen(false);
    setRenameId(null);
    setRenameQuestion("");
  };

  const handlePin = async (id: string) => {
    const ask = inlineAsks.find(a => a.id === id);
    if (ask?.is_pinned) {
      // Unpin
      const { error } = await supabase
        .from("inline_asks")
        .update({ is_pinned: false })
        .eq("id", id);
      
      if (!error) {
        setInlineAsks((prev) =>
          prev.map((a) => (a.id === id ? { ...a, is_pinned: false } : a))
        );
        toast({ title: "Unpinned" });
      }
    } else {
      // Show color picker
      setPendingPinId(id);
      setPinColorOpen(true);
    }
  };

  const handlePinColorSelect = async (color: PinColor) => {
    if (!pendingPinId) return;
    
    const { error } = await supabase
      .from("inline_asks")
      .update({ is_pinned: true, pin_color: color })
      .eq("id", pendingPinId);
    
    if (!error) {
      setInlineAsks((prev) =>
        prev.map((a) => (a.id === pendingPinId ? { ...a, is_pinned: true, pin_color: color } : a))
      );
      toast({ title: "Pinned" });
    }
    setPendingPinId(null);
  };

  const handleArchive = async (id: string) => {
    const ask = inlineAsks.find(a => a.id === id);
    const newArchived = !ask?.is_archived;
    
    const { error } = await supabase
      .from("inline_asks")
      .update({ is_archived: newArchived })
      .eq("id", id);
    
    if (!error) {
      setInlineAsks((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_archived: newArchived } : a))
      );
      toast({ title: newArchived ? "Archived" : "Unarchived" });
    }
  };

  const handleShare = (id: string) => {
    const ask = inlineAsks.find((a) => a.id === id);
    if (ask) {
      navigator.clipboard.writeText(
        `Question: ${ask.question}\n\nHighlighted: ${ask.highlighted_text}\n\nAnswer: ${ask.answer || "N/A"}`
      );
      toast({ title: "Copied to clipboard" });
    }
  };

  const handleOpenInChat = (sessionId: string | null) => {
    if (sessionId) {
      navigate(`/app?chat=${sessionId}`);
    } else {
      toast({ title: "No linked session", description: "This inline ask is not linked to a chat session" });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedAsks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedAsks.size === filteredAsks.length) {
      setSelectedAsks(new Set());
    } else {
      setSelectedAsks(new Set(filteredAsks.map((a) => a.id)));
    }
  };

  return (
    <>
      <Helmet>
        <title>Inline Asks - Proxinex</title>
        <meta name="description" content="View and manage your inline ask history" />
      </Helmet>

      <div className="h-screen bg-background flex overflow-hidden">
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
          inlineAsks={sidebarInlineAsks}
          onSelectInlineAsk={(askId, sessionId) => {
            if (sessionId) {
              navigate(`/app?chat=${sessionId}`);
            }
          }}
          onDeleteInlineAsk={sidebarDeleteInlineAsk}
          onRenameInlineAsk={sidebarRenameInlineAsk}
          onPinInlineAsk={sidebarPinInlineAsk}
          onArchiveInlineAsk={sidebarArchiveInlineAsk}
          onShareInlineAsk={(askId) => {
            navigator.clipboard.writeText(`Inline Ask: ${askId}`);
            toast({ title: "Link copied" });
          }}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <AppHeader
            title="Inline Asks"
            subtitle={`${filteredAsks.length} inline asks`}
            icon={<Sparkles className="h-4 w-4 text-primary" />}
          >
            <div className="flex items-center gap-2 ml-auto">
              {selectedAsks.size > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setBulkDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete ({selectedAsks.size})
                </Button>
              )}
            </div>
          </AppHeader>

          {/* Filters & Search */}
          <div className="p-4 border-b border-border flex flex-wrap items-center gap-3 bg-card/30">
            <div className="flex-1 min-w-[200px] max-w-md relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search inline asks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
                className="h-8"
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filterType === "pinned" ? "default" : "outline"}
                onClick={() => setFilterType("pinned")}
                className="h-8"
              >
                <Pin className="h-3 w-3 mr-1" />
                Pinned
              </Button>
              <Button
                size="sm"
                variant={filterType === "archived" ? "default" : "outline"}
                onClick={() => setFilterType("archived")}
                className="h-8"
              >
                <Archive className="h-3 w-3 mr-1" />
                Archived
              </Button>
            </div>

            <Button size="sm" variant="outline" onClick={selectAll} className="h-8">
              {selectedAsks.size === filteredAsks.length && filteredAsks.length > 0 ? (
                <>
                  <XSquare className="h-3 w-3 mr-1" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-3 w-3 mr-1" />
                  Select All
                </>
              )}
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAsks.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No inline asks match your search" : "No inline asks yet"}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 max-w-4xl mx-auto">
                {filteredAsks.map((ask) => {
                  const colorConfig = pinColors.find(c => c.id === (ask.pin_color || "primary")) || pinColors[0];
                  return (
                    <div
                      key={ask.id}
                      className={`group rounded-lg border p-4 transition-colors ${
                        selectedAsks.has(ask.id)
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <Checkbox
                          checked={selectedAsks.has(ask.id)}
                          onCheckedChange={() => toggleSelect(ask.id)}
                          className="mt-1"
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Question */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {ask.is_pinned && <Pin className={`h-3 w-3 flex-shrink-0 ${colorConfig.text} ${colorConfig.fill}`} />}
                              <span className="font-medium text-foreground text-sm truncate">
                                {ask.title || ask.question}
                              </span>
                            </div>
                          
                          {/* Actions Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-secondary rounded transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => {
                                  setRenameId(ask.id);
                                  setRenameQuestion(ask.question);
                                  setRenameDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-3 w-3 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePin(ask.id)}>
                                <Pin className={`h-3 w-3 mr-2 ${ask.is_pinned ? colorConfig.fill + " " + colorConfig.text : ""}`} />
                                {ask.is_pinned ? "Unpin" : "Pin"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare(ask.id)}>
                                <Share2 className="h-3 w-3 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleArchive(ask.id)}>
                                <Archive className="h-3 w-3 mr-2" />
                                {ask.is_archived ? "Unarchive" : "Archive"}
                              </DropdownMenuItem>
                              {ask.session_id && (
                                <DropdownMenuItem onClick={() => handleOpenInChat(ask.session_id)}>
                                  <ExternalLink className="h-3 w-3 mr-2" />
                                  Open in Chat
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeleteId(ask.id);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Highlighted Text */}
                        <div className="flex items-start gap-2 mb-2 px-3 py-2 rounded bg-secondary/50 border-l-2 border-primary/50">
                          <Quote className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {ask.highlighted_text}
                          </p>
                        </div>

                        {/* Answer Preview */}
                        {ask.answer && (
                          <p className="text-xs text-foreground/80 line-clamp-2 mb-2">
                            {ask.answer}
                          </p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(ask.created_at), "MMM d, yyyy")}
                          </span>
                          {ask.session_id && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              Linked to session
                            </span>
                          )}
                          {ask.conversation_history && ask.conversation_history.length > 0 && (
                            <Badge variant="outline" className="text-[10px] h-5">
                              {ask.conversation_history.length} exchanges
                            </Badge>
                          )}
                        </div>
                      </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Inline Ask</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this inline ask? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedAsks.size} Inline Asks</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAsks.size} inline asks? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Inline Ask</DialogTitle>
            <DialogDescription>Enter a new question for this inline ask.</DialogDescription>
          </DialogHeader>
          <Input
            value={renameQuestion}
            onChange={(e) => setRenameQuestion(e.target.value)}
            placeholder="Question..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pin Color Picker Dialog */}
      <PinColorPickerDialog
        open={pinColorOpen}
        onOpenChange={setPinColorOpen}
        onSelectColor={handlePinColorSelect}
        currentColor="primary"
      />
    </>
  );
};

export default InlineAsksPage;
