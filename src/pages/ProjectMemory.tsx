import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
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
  Brain,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Trash2,
  Edit2,
  Download,
  RefreshCw,
  Target,
  HelpCircle,
  ExternalLink,
  Save,
  X
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sidebarItems = [
  { icon: Plus, label: "New Session", path: "/app", isNew: true },
  { icon: MessageSquare, label: "Chat", path: "/app/chat" },
  { icon: Search, label: "Research", path: "/app/research" },
  { icon: Brain, label: "Memory", path: "/app/memory" },
  { icon: Layers, label: "Sandbox", path: "/app/sandbox" },
  { icon: BookOpen, label: "Notebooks", path: "/app/notebooks" },
  { icon: FileText, label: "Documents", path: "/app/documents" },
  { icon: Image, label: "Images", path: "/app/images" },
  { icon: Video, label: "Video", path: "/app/video" },
  { icon: Code, label: "API Playground", path: "/app/api" },
  { divider: true },
  { icon: BarChart3, label: "Usage & Cost", path: "/app/usage" },
  { icon: Key, label: "API Keys", path: "/app/api-keys" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
];

interface MemoryItem {
  id: string;
  type: "fact" | "decision" | "summary";
  content: string;
  confidence: number;
  verified: boolean;
  sources: number;
  timestamp: Date;
}

interface ProjectSummary {
  goal: string;
  confirmedFacts: string[];
  trustedSources: string[];
  openQuestions: string[];
}

const ProjectMemoryPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Memory settings
  const [autoSaveVerified, setAutoSaveVerified] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);

  // Editable summary
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summary, setSummary] = useState<ProjectSummary>({
    goal: "Research AI funding trends in India for 2025.",
    confirmedFacts: [
      "Government and private AI funding increased in 2025.",
      "Multiple state-backed AI initiatives were launched."
    ],
    trustedSources: [
      "India AI Funding Report (Dec 2025)",
      "Government AI Policy Update"
    ],
    openQuestions: [
      "How does India compare globally?"
    ]
  });
  const [editedSummary, setEditedSummary] = useState(summary);

  // Mock memory items
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([
    {
      id: "1",
      type: "fact",
      content: "India's AI funding grew significantly in 2025, with government initiatives contributing over $2 billion.",
      confidence: 87,
      verified: true,
      sources: 3,
      timestamp: new Date("2025-01-02")
    },
    {
      id: "2",
      type: "decision",
      content: "Focus research on government-backed AI initiatives rather than private sector only.",
      confidence: 92,
      verified: true,
      sources: 2,
      timestamp: new Date("2025-01-01")
    },
    {
      id: "3",
      type: "summary",
      content: "India is emerging as a significant player in AI funding, with a balanced approach between public and private investments.",
      confidence: 78,
      verified: true,
      sources: 4,
      timestamp: new Date("2024-12-30")
    },
    {
      id: "4",
      type: "fact",
      content: "Several Indian states launched dedicated AI centers in 2025.",
      confidence: 85,
      verified: true,
      sources: 2,
      timestamp: new Date("2024-12-28")
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "fact":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "decision":
        return <Lightbulb className="h-4 w-4 text-warning" />;
      case "summary":
        return <FileText className="h-4 w-4 text-primary" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "fact":
        return "VERIFIED FACT";
      case "decision":
        return "DECISION";
      case "summary":
        return "SUMMARY";
      default:
        return type.toUpperCase();
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 85) return "bg-success/20 text-success border-success/30";
    if (confidence >= 70) return "bg-warning/20 text-warning border-warning/30";
    return "bg-muted text-muted-foreground border-border";
  };

  const handleDeleteMemory = (id: string) => {
    setMemoryItems(prev => prev.filter(item => item.id !== id));
    toast({ title: "Removed", description: "Memory item removed" });
  };

  const handleClearAllMemory = () => {
    setMemoryItems([]);
    setSummary({
      goal: "",
      confirmedFacts: [],
      trustedSources: [],
      openQuestions: []
    });
    toast({ title: "Cleared", description: "Project memory cleared" });
  };

  const handleExportMemory = (format: "markdown" | "pdf") => {
    const content = `# Project Memory

## Goal
${summary.goal}

## Confirmed Facts
${summary.confirmedFacts.map(f => `- ${f}`).join('\n')}

## Trusted Sources
${summary.trustedSources.map(s => `- ${s}`).join('\n')}

## Open Questions
${summary.openQuestions.map(q => `- ${q}`).join('\n')}

## Memory Items
${memoryItems.map(item => `### ${getTypeLabel(item.type)}
${item.content}
- Confidence: ${item.confidence}%
- Sources: ${item.sources}
- Date: ${item.timestamp.toLocaleDateString()}
`).join('\n')}
`;
    
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project-memory.${format === "markdown" ? "md" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `Memory exported as ${format}` });
  };

  const handleSaveSummary = () => {
    setSummary(editedSummary);
    setIsEditingSummary(false);
    toast({ title: "Saved", description: "Summary updated" });
  };

  return (
    <>
      <Helmet>
        <title>Project Memory - Proxinex</title>
        <meta name="description" content="View and manage what Proxinex remembers about your projects." />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} border-r border-border bg-sidebar flex flex-col transition-all duration-300 flex-shrink-0`}>
          <div className="h-16 border-b border-sidebar-border flex items-center px-4">
            <Link to="/"><Logo size="sm" showText={!sidebarCollapsed} /></Link>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            {sidebarItems.map((item, index) => {
              if ('divider' in item && item.divider) return <div key={index} className="my-4 border-t border-sidebar-border" />;
              const Icon = item.icon!;
              const isActive = item.path === "/app/memory";
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

        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Memory Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Project Memory</h1>
                    <p className="text-sm text-muted-foreground">What Proxinex remembers about your project</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportMemory("markdown")} className="border-border">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Memory Summary Card */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold text-foreground">🧠 What Proxinex Remembers</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditingSummary ? (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditingSummary(false)}>
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveSummary} className="bg-primary text-primary-foreground">
                          <Save className="h-4 w-4 mr-1" /> Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => { setEditedSummary(summary); setIsEditingSummary(true); }}>
                          <Edit2 className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive">
                          <RefreshCw className="h-4 w-4 mr-1" /> Clean up
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Goal */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Goal</span>
                    </div>
                    {isEditingSummary ? (
                      <input
                        type="text"
                        value={editedSummary.goal}
                        onChange={(e) => setEditedSummary(prev => ({ ...prev, goal: e.target.value }))}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                      />
                    ) : (
                      <p className="text-foreground/90 pl-6">{summary.goal || "No goal set"}</p>
                    )}
                  </div>

                  {/* Confirmed Facts */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium text-foreground">Confirmed Facts</span>
                    </div>
                    {isEditingSummary ? (
                      <textarea
                        value={editedSummary.confirmedFacts.join('\n')}
                        onChange={(e) => setEditedSummary(prev => ({ ...prev, confirmedFacts: e.target.value.split('\n').filter(Boolean) }))}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground min-h-[80px]"
                        placeholder="One fact per line..."
                      />
                    ) : (
                      <ul className="space-y-1 pl-6">
                        {summary.confirmedFacts.map((fact, i) => (
                          <li key={i} className="text-foreground/90 flex items-start gap-2">
                            <span className="text-success mt-1.5">•</span>
                            {fact}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Trusted Sources */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ExternalLink className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Trusted Sources</span>
                    </div>
                    {isEditingSummary ? (
                      <textarea
                        value={editedSummary.trustedSources.join('\n')}
                        onChange={(e) => setEditedSummary(prev => ({ ...prev, trustedSources: e.target.value.split('\n').filter(Boolean) }))}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground min-h-[60px]"
                        placeholder="One source per line..."
                      />
                    ) : (
                      <ul className="space-y-1 pl-6">
                        {summary.trustedSources.map((source, i) => (
                          <li key={i} className="text-foreground/90 flex items-start gap-2">
                            <span className="text-primary mt-1.5">•</span>
                            {source}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Open Questions */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium text-foreground">Open Questions</span>
                    </div>
                    {isEditingSummary ? (
                      <textarea
                        value={editedSummary.openQuestions.join('\n')}
                        onChange={(e) => setEditedSummary(prev => ({ ...prev, openQuestions: e.target.value.split('\n').filter(Boolean) }))}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground min-h-[60px]"
                        placeholder="One question per line..."
                      />
                    ) : (
                      <ul className="space-y-1 pl-6">
                        {summary.openQuestions.map((question, i) => (
                          <li key={i} className="text-foreground/90 flex items-start gap-2">
                            <span className="text-warning mt-1.5">•</span>
                            {question}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Memory Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Memory Items</h3>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                    {memoryItems.length} items
                  </span>
                </div>

                <div className="space-y-3">
                  {memoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        {getTypeIcon(item.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px] uppercase font-medium">
                              {getTypeLabel(item.type)}
                            </Badge>
                            <Badge className={`text-[10px] border ${getConfidenceBadge(item.confidence)}`}>
                              {item.confidence}% Confidence
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.sources} source{item.sources !== 1 ? 's' : ''}
                            </span>
                            {item.verified && (
                              <span className="text-xs text-success flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Verified
                              </span>
                            )}
                          </div>
                          <p className="text-foreground/90">{item.content}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground">
                              {item.timestamp.toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="ghost" className="h-7 text-xs">
                                <ExternalLink className="h-3 w-3 mr-1" /> View sources
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-destructive"
                                onClick={() => handleDeleteMemory(item.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" /> Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {memoryItems.length === 0 && (
                    <div className="text-center py-12 bg-card border border-border rounded-xl">
                      <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium text-foreground mb-2">No memories yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Verified facts, decisions, and summaries will appear here.
                      </p>
                    </div>
                  )}
                </div>

                {/* Info Notice */}
                <div className="mt-6 p-4 bg-secondary/30 border border-border rounded-xl">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Some interactions are not saved to reduce noise. Only verified facts, decisions, and summaries with confidence ≥75% are stored.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Controls */}
          <div className="w-80 border-l border-border bg-card/50 p-6 overflow-y-auto flex-shrink-0">
            <h3 className="font-semibold text-foreground mb-6">Memory Controls</h3>

            <div className="space-y-6">
              {/* Auto-save toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-save verified knowledge</p>
                  <p className="text-xs text-muted-foreground">Automatically store high-confidence facts</p>
                </div>
                <Switch
                  checked={autoSaveVerified}
                  onCheckedChange={setAutoSaveVerified}
                />
              </div>

              {/* Require approval toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">Require my approval</p>
                    <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">Pro+</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Review before saving to memory</p>
                </div>
                <Switch
                  checked={requireApproval}
                  onCheckedChange={setRequireApproval}
                />
              </div>

              <div className="border-t border-border pt-6 space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-border"
                  onClick={() => handleExportMemory("markdown")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as Markdown
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-border"
                  onClick={() => handleExportMemory("pdf")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
              </div>

              <div className="border-t border-border pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={handleClearAllMemory}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear project memory
                </Button>
              </div>

              {/* Stats */}
              <div className="border-t border-border pt-6">
                <h4 className="text-sm font-medium text-foreground mb-4">Memory Stats</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{memoryItems.length}</p>
                    <p className="text-xs text-muted-foreground">Total Items</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-success">{memoryItems.filter(i => i.verified).length}</p>
                    <p className="text-xs text-muted-foreground">Verified</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{memoryItems.filter(i => i.type === "fact").length}</p>
                    <p className="text-xs text-muted-foreground">Facts</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{memoryItems.filter(i => i.type === "decision").length}</p>
                    <p className="text-xs text-muted-foreground">Decisions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProjectMemoryPage;
