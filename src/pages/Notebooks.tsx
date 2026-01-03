import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Layers, 
  BookOpen, 
  FileText, 
  Image, 
  Video, 
  Code,
  BarChart3,
  Key,
  Settings,
  ChevronLeft,
  ChevronRight,
  Star,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  FileCode,
  Table,
  Type
} from "lucide-react";
import { Helmet } from "react-helmet-async";

const sidebarItems = [
  { icon: Plus, label: "New Session", path: "/app", isNew: true },
  { icon: MessageSquare, label: "Chat", path: "/app/chat" },
  { icon: Search, label: "Research", path: "/app/research" },
  { icon: Layers, label: "Sandbox", path: "/app/sandbox" },
  { icon: BookOpen, label: "Notebooks", path: "/app/notebooks" },
  { icon: FileText, label: "Documents", path: "/app/documents" },
  { icon: Image, label: "Images", path: "/app/images" },
  { icon: Video, label: "Video", path: "/app/video" },
  { icon: Code, label: "API Playground", path: "/app/api" },
  { divider: true },
  { icon: BarChart3, label: "Usage & Cost", path: "/app/usage" },
  { icon: Key, label: "API Keys", path: "/app/keys" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
];

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
  type: "text" | "code" | "table";
  content: string;
}

const NotebooksPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBlockType, setNewBlockType] = useState<"text" | "code" | "table">("text");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) fetchNotebooks();
  }, [user]);

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

  return (
    <>
      <Helmet>
        <title>Notebooks - Proxinex</title>
        <meta name="description" content="Save, annotate, and organize your research with notebooks." />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} border-r border-border bg-sidebar flex flex-col transition-all duration-300`}>
          <div className="h-16 border-b border-sidebar-border flex items-center px-4">
            <Link to="/"><Logo size="sm" showText={!sidebarCollapsed} /></Link>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            {sidebarItems.map((item, index) => {
              if ('divider' in item && item.divider) return <div key={index} className="my-4 border-t border-sidebar-border" />;
              const Icon = item.icon!;
              const isActive = item.path === "/app/notebooks";
              return (
                <Link key={item.path} to={item.path!} className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'}`}>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="h-12 border-t border-sidebar-border flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/50">
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 flex">
          {/* Notebooks List */}
          <div className="w-72 border-r border-border bg-card/50 flex flex-col">
            <div className="h-16 border-b border-border flex items-center justify-between px-4">
              <h2 className="font-semibold text-foreground">Notebooks</h2>
              <Button size="sm" onClick={createNotebook} className="bg-primary text-primary-foreground">
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
                        {nb.is_favorite && <Star className="h-3 w-3 text-primary fill-primary" />}
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
          <div className="flex-1 flex flex-col">
            {selectedNotebook ? (
              <>
                <div className="h-16 border-b border-border flex items-center justify-between px-6">
                  <div className="flex items-center gap-3">
                    {editingTitle ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="px-2 py-1 bg-input border border-border rounded text-foreground"
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" onClick={() => {
                          const updated = { ...selectedNotebook, title: newTitle };
                          setSelectedNotebook(updated);
                          updateNotebook(updated);
                          setEditingTitle(false);
                        }}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingTitle(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h1 className="font-semibold text-foreground">{selectedNotebook.title}</h1>
                        <Button size="sm" variant="ghost" onClick={() => { setNewTitle(selectedNotebook.title); setEditingTitle(true); }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => {
                      const updated = { ...selectedNotebook, is_favorite: !selectedNotebook.is_favorite };
                      setSelectedNotebook(updated);
                      updateNotebook(updated);
                    }}>
                      <Star className={`h-4 w-4 ${selectedNotebook.is_favorite ? 'fill-primary text-primary' : ''}`} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateNotebook(selectedNotebook)} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteNotebook(selectedNotebook.id)}>
                      <Trash2 className="h-4 w-4" />
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
                        {block.type === "text" && (
                          <textarea
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, e.target.value)}
                            placeholder="Write something..."
                            className="w-full min-h-[100px] p-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        )}
                        {block.type === "code" && (
                          <div className="relative">
                            <div className="absolute top-2 right-2 text-xs text-muted-foreground">Code</div>
                            <textarea
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, e.target.value)}
                              placeholder="// Write code here..."
                              className="w-full min-h-[150px] p-4 bg-card border border-border rounded-lg font-mono text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        )}
                        {block.type === "table" && (
                          <div className="p-4 bg-card border border-border rounded-lg">
                            <div className="text-xs text-muted-foreground mb-2">Table (Markdown)</div>
                            <textarea
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, e.target.value)}
                              placeholder="| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |"
                              className="w-full min-h-[100px] p-2 bg-muted/30 rounded font-mono text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add Block Buttons */}
                    <div className="flex items-center gap-2 pt-4">
                      <Button size="sm" variant="outline" onClick={() => addBlock("text")} className="border-border">
                        <Type className="h-4 w-4 mr-1" /> Text
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => addBlock("code")} className="border-border">
                        <FileCode className="h-4 w-4 mr-1" /> Code
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => addBlock("table")} className="border-border">
                        <Table className="h-4 w-4 mr-1" /> Table
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">Select a Notebook</h2>
                  <p className="text-muted-foreground mb-4">Choose a notebook from the list or create a new one</p>
                  <Button onClick={createNotebook} className="bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" /> New Notebook
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default NotebooksPage;
