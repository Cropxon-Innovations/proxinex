import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useHistoryData } from "@/hooks/useHistoryData";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { UsageLimitModal } from "@/components/UsageLimitModal";
import { 
  Plus, 
  BookOpen, 
  Star,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  FileCode,
  Table,
  Type,
  Users,
  MessageCircle,
  History,
  Share2,
  Sparkles,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InlineAskBlock } from "@/components/notebook/InlineAskBlock";

interface Notebook {
  id: string;
  title: string;
  description: string | null;
  content: any[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

interface ContentBlock {
  id: string;
  type: "text" | "code" | "table" | "inline_ask";
  content: string;
}

interface Comment {
  id: string;
  blockId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
  resolved: boolean;
}

interface VersionEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  blockId?: string;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "online" | "offline" | "editing";
  color: string;
}

const NotebooksPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [rightPanelTab, setRightPanelTab] = useState<"collaborators" | "comments" | "history">("collaborators");
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { plan } = useUserPlan();
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
  
  const isFreePlan = plan === "free";
  const canCreateMore = !isFreePlan || canUseFeature("notebooks");

  // Collaboration state (mock data for demo)
  const [collaborators] = useState<Collaborator[]>([
    { id: "1", name: "You", email: "you@example.com", status: "editing", color: "#10b981" },
    { id: "2", name: "Alex Chen", email: "alex@example.com", status: "online", color: "#6366f1" },
    { id: "3", name: "Sarah Miller", email: "sarah@example.com", status: "offline", color: "#f59e0b" },
  ]);

  const [comments, setComments] = useState<Comment[]>([
    { id: "1", blockId: "block-1", userId: "2", userName: "Alex Chen", text: "Can we add more details here?", timestamp: new Date(), resolved: false },
    { id: "2", blockId: "block-2", userId: "3", userName: "Sarah Miller", text: "Great analysis!", timestamp: new Date(Date.now() - 3600000), resolved: true },
  ]);

  const [versionHistory] = useState<VersionEntry[]>([
    { id: "1", timestamp: new Date(), userId: "1", userName: "You", action: "Edited text block", blockId: "block-1" },
    { id: "2", timestamp: new Date(Date.now() - 1800000), userId: "2", userName: "Alex Chen", action: "Added code block" },
    { id: "3", timestamp: new Date(Date.now() - 3600000), userId: "3", userName: "Sarah Miller", action: "Created notebook" },
  ]);

  const [newComment, setNewComment] = useState("");
  const [commentingOnBlock, setCommentingOnBlock] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchNotebooks();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const fetchNotebooks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("notebooks")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load notebooks", variant: "destructive" });
    } else {
      const parsed = (data || []).map(nb => ({
        ...nb,
        content: Array.isArray(nb.content) ? nb.content : []
      })) as Notebook[];
      setNotebooks(parsed);
    }
    setIsLoading(false);
  };

  const createNotebook = async () => {
    if (!user) return;
    
    // Check usage limits
    if (!canUseFeature("notebooks")) {
      setLimitModalOpen(true);
      return;
    }

    // Increment usage
    const success = await incrementUsage("notebooks");
    if (!success) {
      setLimitModalOpen(true);
      return;
    }
    
    const { data, error } = await supabase
      .from("notebooks")
      .insert({ user_id: user.id, title: "Untitled Notebook", content: [] })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create notebook", variant: "destructive" });
    } else if (data) {
      const parsed = { ...data, content: Array.isArray(data.content) ? data.content : [] } as Notebook;
      setNotebooks(prev => [parsed, ...prev]);
      setSelectedNotebook(parsed);
      toast({ title: "Created", description: "New notebook created" });
    }
  };

  const updateNotebook = async (notebook: Notebook) => {
    setIsSaving(true);
    const { error } = await supabase
      .from("notebooks")
      .update({ 
        title: notebook.title, 
        content: notebook.content,
        is_favorite: notebook.is_favorite 
      })
      .eq("id", notebook.id);

    if (error) {
      toast({ title: "Error", description: "Failed to save notebook", variant: "destructive" });
    } else {
      setNotebooks(prev => prev.map(n => n.id === notebook.id ? notebook : n));
      toast({ title: "Saved", description: "Notebook saved" });
    }
    setIsSaving(false);
  };

  const deleteNotebook = async (id: string) => {
    const { error } = await supabase.from("notebooks").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete notebook", variant: "destructive" });
    } else {
      setNotebooks(prev => prev.filter(n => n.id !== id));
      if (selectedNotebook?.id === id) setSelectedNotebook(null);
      toast({ title: "Deleted", description: "Notebook deleted" });
    }
  };

  const addBlock = (type: "text" | "code" | "table") => {
    if (!selectedNotebook) return;
    const newBlock: ContentBlock = { id: crypto.randomUUID(), type, content: "" };
    const updated = { ...selectedNotebook, content: [...(selectedNotebook.content || []), newBlock] };
    setSelectedNotebook(updated);
  };

  const updateBlock = (blockId: string, content: string) => {
    if (!selectedNotebook) return;
    const updated = {
      ...selectedNotebook,
      content: selectedNotebook.content.map((b: ContentBlock) => 
        b.id === blockId ? { ...b, content } : b
      )
    };
    setSelectedNotebook(updated);
  };

  const deleteBlock = (blockId: string) => {
    if (!selectedNotebook) return;
    const updated = {
      ...selectedNotebook,
      content: selectedNotebook.content.filter((b: ContentBlock) => b.id !== blockId)
    };
    setSelectedNotebook(updated);
  };

  const addComment = (blockId: string) => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: crypto.randomUUID(),
      blockId,
      userId: "1",
      userName: "You",
      text: newComment,
      timestamp: new Date(),
      resolved: false
    };
    setComments(prev => [...prev, comment]);
    setNewComment("");
    setCommentingOnBlock(null);
    toast({ title: "Comment added" });
  };

  const resolveComment = (commentId: string) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, resolved: true } : c));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-success";
      case "editing": return "bg-primary animate-pulse";
      case "offline": return "bg-muted-foreground";
      default: return "bg-muted-foreground";
    }
  };

  return (
    <>
      <Helmet>
        <title>Notebooks - Proxinex</title>
        <meta name="description" content="Save, annotate, and organize your research with notebooks." />
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

        {/* Main */}
        <main className="flex-1 flex overflow-hidden">
          {/* Notebooks List */}
          <div className="w-72 border-r border-border bg-card/50 flex flex-col flex-shrink-0">
            <div className="h-14 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-foreground text-sm">Notebooks</h2>
                {limits.notebooks !== Infinity && (
                  <Badge variant="secondary" className="text-[10px] h-4">
                    {getUsageDisplay("notebooks")}
                  </Badge>
                )}
              </div>
              <Button 
                size="sm" 
                onClick={createNotebook} 
                className="h-8 w-8 p-0"
                disabled={!canCreateMore}
                title={!canCreateMore ? "Notebook limit reached" : "Create notebook"}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : notebooks.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notebooks yet</p>
                  <Button size="sm" variant="ghost" onClick={createNotebook} className="mt-2">Create one</Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {notebooks.map((nb) => (
                    <div
                      key={nb.id}
                      onClick={() => setSelectedNotebook(nb)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedNotebook?.id === nb.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-secondary/50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground text-sm truncate">{nb.title}</span>
                        {nb.is_favorite && <Star className="h-3 w-3 text-primary fill-primary flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(nb.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedNotebook ? (
              <>
                <div className="h-14 border-b border-border flex items-center justify-between px-6 flex-shrink-0 bg-background">
                  <div className="flex items-center gap-3">
                    {editingTitle ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="px-2 py-1 bg-input border border-border rounded text-foreground text-sm"
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
                          const updated = { ...selectedNotebook, title: newTitle };
                          setSelectedNotebook(updated);
                          updateNotebook(updated);
                          setEditingTitle(false);
                        }}>
                          <Save className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingTitle(false)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h1 className="font-semibold text-foreground text-sm">{selectedNotebook.title}</h1>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setNewTitle(selectedNotebook.title); setEditingTitle(true); }}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Live collaborators avatars */}
                    <div className="flex -space-x-2 mr-2">
                      {collaborators.filter(c => c.status !== "offline").map((collab) => (
                        <div key={collab.id} className="relative">
                          <Avatar className="h-7 w-7 border-2 border-background">
                            <AvatarFallback style={{ backgroundColor: collab.color }} className="text-[10px] text-white">
                              {collab.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-background ${getStatusColor(collab.status)}`} />
                        </div>
                      ))}
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 gap-1.5">
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => {
                      const updated = { ...selectedNotebook, is_favorite: !selectedNotebook.is_favorite };
                      setSelectedNotebook(updated);
                      updateNotebook(updated);
                    }}>
                      <Star className={`h-3.5 w-3.5 ${selectedNotebook.is_favorite ? 'fill-primary text-primary' : ''}`} />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => updateNotebook(selectedNotebook)} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => deleteNotebook(selectedNotebook.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-3xl mx-auto space-y-4">
                    {(selectedNotebook.content || []).map((block: ContentBlock) => (
                      <div key={block.id} className="group relative">
                        <button
                          onClick={() => deleteBlock(block.id)}
                          className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        
                        {/* Comment indicator */}
                        {comments.filter(c => c.blockId === block.id && !c.resolved).length > 0 && (
                          <div className="absolute -right-6 top-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {comments.filter(c => c.blockId === block.id && !c.resolved).length}
                          </div>
                        )}
                        
                        {block.type === "text" && (
                          <textarea
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, e.target.value)}
                            placeholder="Write something..."
                            className="w-full bg-transparent text-foreground resize-none focus:outline-none min-h-[80px] p-3 rounded-lg border border-transparent hover:border-border focus:border-primary transition-colors"
                          />
                        )}
                        {block.type === "code" && (
                          <div className="relative">
                            <Badge className="absolute top-2 right-2 bg-secondary text-xs">Code</Badge>
                            <textarea
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, e.target.value)}
                              placeholder="// Code block"
                              className="w-full bg-secondary text-foreground font-mono text-sm resize-none focus:outline-none min-h-[120px] p-4 rounded-lg border border-border focus:border-primary"
                            />
                          </div>
                        )}
                        {block.type === "table" && (
                          <div className="border border-border rounded-lg p-4">
                            <Badge className="mb-2 bg-secondary text-xs">Table</Badge>
                            <textarea
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, e.target.value)}
                              placeholder="| Col 1 | Col 2 |"
                              className="w-full bg-transparent text-foreground font-mono text-sm resize-none focus:outline-none min-h-[80px]"
                            />
                          </div>
                        )}
                        {block.type === "inline_ask" && (
                          <InlineAskBlock 
                            content={block.content} 
                            onDelete={() => deleteBlock(block.id)}
                          />
                        )}

                        {/* Add comment button */}
                        <button
                          onClick={() => setCommentingOnBlock(commentingOnBlock === block.id ? null : block.id)}
                          className="absolute -right-6 top-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>

                        {/* Comment input */}
                        {commentingOnBlock === block.id && (
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Add a comment..."
                              className="flex-1 px-3 py-1.5 bg-input border border-border rounded text-sm"
                              autoFocus
                            />
                            <Button size="sm" onClick={() => addComment(block.id)}>Add</Button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add block buttons */}
                    <div className="flex gap-2 justify-center pt-4 opacity-50 hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" onClick={() => addBlock("text")} className="gap-1.5">
                        <Type className="h-3.5 w-3.5" /> Text
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addBlock("code")} className="gap-1.5">
                        <FileCode className="h-3.5 w-3.5" /> Code
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addBlock("table")} className="gap-1.5">
                        <Table className="h-3.5 w-3.5" /> Table
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-foreground mb-2">Select a notebook</h2>
                  <p className="text-sm text-muted-foreground mb-4">Choose from the left or create a new one</p>
                  <Button onClick={createNotebook} className="gap-2">
                    <Plus className="h-4 w-4" /> Create Notebook
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          {selectedNotebook && (
            <div className="w-72 border-l border-border bg-card/50 flex flex-col flex-shrink-0 hidden xl:flex">
              <div className="flex border-b border-border flex-shrink-0">
                <button
                  onClick={() => setRightPanelTab("collaborators")}
                  className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 ${rightPanelTab === "collaborators" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
                >
                  <Users className="h-3.5 w-3.5" /> Team
                </button>
                <button
                  onClick={() => setRightPanelTab("comments")}
                  className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 ${rightPanelTab === "comments" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Comments
                </button>
                <button
                  onClick={() => setRightPanelTab("history")}
                  className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 ${rightPanelTab === "history" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
                >
                  <History className="h-3.5 w-3.5" /> History
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {rightPanelTab === "collaborators" && (
                  <div className="space-y-3">
                    {collaborators.map((collab) => (
                      <div key={collab.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback style={{ backgroundColor: collab.color }} className="text-xs text-white">
                              {collab.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-background ${getStatusColor(collab.status)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{collab.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{collab.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {rightPanelTab === "comments" && (
                  <div className="space-y-3">
                    {comments.filter(c => !c.resolved).map((comment) => (
                      <div key={comment.id} className="p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-foreground">{comment.userName}</span>
                          <button
                            onClick={() => resolveComment(comment.id)}
                            className="text-xs text-muted-foreground hover:text-primary"
                          >
                            Resolve
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.text}</p>
                      </div>
                    ))}
                    {comments.filter(c => !c.resolved).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No open comments</p>
                    )}
                  </div>
                )}

                {rightPanelTab === "history" && (
                  <div className="space-y-3">
                    {versionHistory.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3 p-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{entry.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.userName} • {entry.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <UsageLimitModal
        open={limitModalOpen}
        onOpenChange={setLimitModalOpen}
        feature="notebooks"
        usageCount={usage.notebooks}
        limit={limits.notebooks}
        requiredPlan={getRequiredPlanForUnlimited("notebooks")}
      />
    </>
  );
};

export default NotebooksPage;
