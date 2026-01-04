import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useHistoryData } from "@/hooks/useHistoryData";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import {
  FolderOpen,
  Plus,
  Search,
  Clock,
  MessageSquare,
  FileText,
  Brain,
  Star,
  MoreVertical,
  Trash2,
  Edit3,
  Copy,
  Archive,
  Grid3X3,
  List,
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Project {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  messageCount: number;
  sourceCount: number;
  memoryItems: number;
  status: "active" | "archived";
  isFavorite: boolean;
  color: string;
}

const initialProjects: Project[] = [
  {
    id: "1",
    name: "AI Funding Research 2025",
    description: "Research on AI funding trends in India for 2025",
    lastUpdated: "2 hours ago",
    messageCount: 45,
    sourceCount: 12,
    memoryItems: 8,
    status: "active",
    isFavorite: true,
    color: "hsl(186 100% 50%)",
  },
  {
    id: "2",
    name: "Market Analysis",
    description: "Competitive market analysis for SaaS products",
    lastUpdated: "Yesterday",
    messageCount: 28,
    sourceCount: 7,
    memoryItems: 5,
    status: "active",
    isFavorite: false,
    color: "hsl(142 71% 45%)",
  },
  {
    id: "3",
    name: "Technical Documentation",
    description: "API documentation and developer guides",
    lastUpdated: "3 days ago",
    messageCount: 62,
    sourceCount: 15,
    memoryItems: 12,
    status: "active",
    isFavorite: true,
    color: "hsl(262 83% 58%)",
  },
  {
    id: "4",
    name: "Customer Insights",
    description: "Customer feedback and behavior analysis",
    lastUpdated: "1 week ago",
    messageCount: 34,
    sourceCount: 9,
    memoryItems: 6,
    status: "archived",
    isFavorite: false,
    color: "hsl(38 92% 50%)",
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [filter, setFilter] = useState<"all" | "favorites" | "archived">("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === "favorites") return matchesSearch && project.isFavorite;
    if (filter === "archived") return matchesSearch && project.status === "archived";
    return matchesSearch && project.status === "active";
  });

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    const colors = [
      "hsl(186 100% 50%)",
      "hsl(142 71% 45%)",
      "hsl(262 83% 58%)",
      "hsl(38 92% 50%)",
      "hsl(339 90% 51%)",
    ];

    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || "No description",
      lastUpdated: "Just now",
      messageCount: 0,
      sourceCount: 0,
      memoryItems: 0,
      status: "active",
      isFavorite: false,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setProjects(prev => [newProject, ...prev]);
    setShowCreateDialog(false);
    setNewProjectName("");
    setNewProjectDescription("");
    toast({ title: "Project created", description: `${newProject.name} is ready` });
  };

  const toggleFavorite = (id: string) => {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const archiveProject = (id: string) => {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, status: "archived" as const } : p))
    );
    toast({ title: "Project archived" });
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    toast({ title: "Project deleted" });
  };

  const duplicateProject = (project: Project) => {
    const newProject: Project = {
      ...project,
      id: Math.random().toString(36).substr(2, 9),
      name: `${project.name} (Copy)`,
      lastUpdated: "Just now",
    };
    setProjects(prev => [newProject, ...prev]);
    toast({ title: "Project duplicated" });
  };

  return (
    <>
      <Helmet>
        <title>Projects - Proxinex</title>
        <meta name="description" content="Organize and manage your research projects" />
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
                <FolderOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground text-sm">Projects</h1>
                <span className="text-xs text-muted-foreground">{projects.length} projects</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
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
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <ThemeToggle />
              <Button onClick={() => setShowCreateDialog(true)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Filters */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex bg-secondary rounded-lg p-1">
                {(["all", "favorites", "archived"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${
                      filter === f
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Projects Grid/List */}
            {filteredProjects.length === 0 ? (
              <Card className="py-16">
                <div className="text-center">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No projects found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ? "Try a different search term" : "Create your first project to get started"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Project
                    </Button>
                  )}
                </div>
              </Card>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="group hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.name.charAt(0)}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(project.id); }}
                            className={`p-1.5 rounded-md transition-colors ${
                              project.isFavorite ? "text-yellow-500" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Star className={`h-4 w-4 ${project.isFavorite ? "fill-current" : ""}`} />
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => duplicateProject(project)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => archiveProject(project.id)}>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteProject(project.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <Link to="/app" className="block mt-3">
                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                          {project.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      </Link>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {project.messageCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {project.sourceCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          {project.memoryItems}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
                        <Clock className="h-3 w-3" />
                        {project.lastUpdated}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold shrink-0"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link to="/app" className="font-medium hover:text-primary transition-colors">
                            {project.name}
                          </Link>
                          <p className="text-sm text-muted-foreground truncate">
                            {project.description}
                          </p>
                        </div>
                        <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {project.messageCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {project.sourceCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            {project.memoryItems}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {project.lastUpdated}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleFavorite(project.id)}
                            className={`p-1.5 rounded-md transition-colors ${
                              project.isFavorite ? "text-yellow-500" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Star className={`h-4 w-4 ${project.isFavorite ? "fill-current" : ""}`} />
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => duplicateProject(project)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => archiveProject(project.id)}>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteProject(project.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Organize your research with a dedicated project space
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground">Project Name</label>
              <Input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., Market Research 2025"
                className="w-full mt-2"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description (optional)</label>
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="What is this project about?"
                rows={3}
                className="w-full mt-2 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
