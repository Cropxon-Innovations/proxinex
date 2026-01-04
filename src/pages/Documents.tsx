import { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useHistoryData } from "@/hooks/useHistoryData";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { UsageLimitModal } from "@/components/UsageLimitModal";
import {
  FileText,
  Upload,
  Folder,
  MoreVertical,
  Trash2,
  Eye,
  Download,
  Search,
  Grid,
  List,
  Sparkles,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  analyzed: boolean;
  summary?: string;
  tags?: string[];
  status: "uploading" | "analyzing" | "ready" | "error";
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Q4 Financial Report.pdf",
    type: "pdf",
    size: 2400000,
    uploadedAt: new Date("2025-01-02"),
    analyzed: true,
    summary: "Quarterly financial report showing 15% revenue growth...",
    tags: ["finance", "quarterly"],
    status: "ready",
  },
  {
    id: "2",
    name: "Product Roadmap 2025.docx",
    type: "docx",
    size: 1200000,
    uploadedAt: new Date("2025-01-01"),
    analyzed: true,
    summary: "Strategic roadmap outlining key product initiatives...",
    tags: ["product", "strategy"],
    status: "ready",
  },
  {
    id: "3",
    name: "User Research Findings.pdf",
    type: "pdf",
    size: 5600000,
    uploadedAt: new Date("2024-12-28"),
    analyzed: true,
    summary: "Comprehensive user research with 500+ participants...",
    tags: ["research", "ux"],
    status: "ready",
  },
];

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return "📄";
    case "docx":
    case "doc":
      return "📝";
    case "xlsx":
    case "xls":
      return "📊";
    case "pptx":
    case "ppt":
      return "📽️";
    default:
      return "📎";
  }
};

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  }, []);

  const handleFileUpload = async (files: File[]) => {
    // Check usage limits before uploading
    if (!canUseFeature("documents")) {
      setLimitModalOpen(true);
      return;
    }

    // Increment usage
    const success = await incrementUsage("documents");
    if (!success) {
      setLimitModalOpen(true);
      return;
    }

    files.forEach((file) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newDoc: Document = {
        id,
        name: file.name,
        type: file.name.split(".").pop() || "unknown",
        size: file.size,
        uploadedAt: new Date(),
        analyzed: false,
        status: "uploading",
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setUploadProgress((prev) => ({ ...prev, [id]: 0 }));

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Start analysis
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === id ? { ...doc, status: "analyzing" } : doc
            )
          );

          // Simulate analysis
          setTimeout(() => {
            setDocuments((prev) =>
              prev.map((doc) =>
                doc.id === id
                  ? {
                      ...doc,
                      status: "ready",
                      analyzed: true,
                      summary: "AI-powered analysis completed. Key insights extracted.",
                      tags: ["auto-tagged"],
                    }
                  : doc
              )
            );
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[id];
              return newProgress;
            });
            toast({
              title: "Document Ready",
              description: `${file.name} has been analyzed`,
            });
          }, 3000);
        }
        setUploadProgress((prev) => ({ ...prev, [id]: progress }));
      }, 200);
    });

    toast({
      title: `Uploading ${files.length} file(s)`,
      description: "AI analysis will start automatically",
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    toast({ title: "Document deleted" });
  };

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Documents - Proxinex</title>
        <meta name="description" content="Upload and analyze documents with AI" />
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

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-14 border-b border-border flex items-center justify-between px-6 flex-shrink-0 bg-background">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground text-sm">Documents</h1>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{documents.length} files</span>
                  {limits.documents !== Infinity && (
                    <Badge variant="secondary" className="text-[10px] h-4">
                      {getUsageDisplay("documents")} used
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 h-9"
                />
              </div>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <label>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                />
                <Button className="gap-2 cursor-pointer h-9" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Upload
                  </span>
                </Button>
              </label>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mb-6 border-2 border-dashed rounded-xl p-8 transition-all ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">
                  Drop files here to upload
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Supports PDF, DOC, XLS, PPT, and more
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  AI-powered analysis included
                </div>
              </div>
            </div>

            {/* Documents Grid/List */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{getFileIcon(doc.type)}</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Analyze
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteDocument(doc.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h4 className="font-medium text-foreground text-sm truncate mb-1">
                      {doc.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
                    </p>

                    {/* Status */}
                    {doc.status === "uploading" && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Uploading...
                        </div>
                        <Progress value={uploadProgress[doc.id] || 0} className="h-1" />
                      </div>
                    )}

                    {doc.status === "analyzing" && (
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <Sparkles className="h-3 w-3 animate-pulse" />
                        Analyzing with AI...
                      </div>
                    )}

                    {doc.status === "ready" && doc.analyzed && (
                      <div className="flex items-center gap-2 text-xs text-success">
                        <CheckCircle className="h-3 w-3" />
                        AI Analyzed
                      </div>
                    )}

                    {doc.status === "error" && (
                      <div className="flex items-center gap-2 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        Error
                      </div>
                    )}

                    {/* Tags */}
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 bg-secondary text-muted-foreground rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="border-t border-border hover:bg-secondary/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{getFileIcon(doc.type)}</span>
                            <span className="text-sm font-medium text-foreground truncate max-w-xs">{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{formatFileSize(doc.size)}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{doc.uploadedAt.toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          {doc.status === "ready" && (
                            <span className="text-xs text-success flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Ready
                            </span>
                          )}
                          {doc.status === "analyzing" && (
                            <span className="text-xs text-primary flex items-center gap-1">
                              <Sparkles className="h-3 w-3 animate-pulse" /> Analyzing
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => deleteDocument(doc.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <UsageLimitModal
        open={limitModalOpen}
        onOpenChange={setLimitModalOpen}
        feature="documents"
        usageCount={usage.documents}
        limit={limits.documents}
        requiredPlan={getRequiredPlanForUnlimited("documents")}
      />
    </>
  );
}
