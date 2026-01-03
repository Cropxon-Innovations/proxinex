import { useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
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
  Sparkles,
  Sliders,
  MessageCircle,
  Zap,
  BookMarked,
  Globe,
  Save,
  RotateCcw,
  Brain
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface PersonalizationSettings {
  tone: "professional" | "casual" | "technical" | "friendly" | "concise";
  responseLength: "brief" | "moderate" | "detailed" | "comprehensive";
  creativity: number;
  language: string;
  autoSuggest: boolean;
  includeEmojis: boolean;
  codeStyle: "minimal" | "commented" | "documented";
  citationStyle: "inline" | "footnotes" | "none";
  focusAreas: string[];
  avoidTopics: string[];
}

const toneDescriptions = {
  professional: "Formal and business-appropriate",
  casual: "Relaxed and conversational",
  technical: "Precise and detail-oriented",
  friendly: "Warm and approachable",
  concise: "Brief and to the point"
};

const PersonalizationPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  const [settings, setSettings] = useState<PersonalizationSettings>({
    tone: "professional",
    responseLength: "moderate",
    creativity: 50,
    language: "en",
    autoSuggest: true,
    includeEmojis: false,
    codeStyle: "commented",
    citationStyle: "inline",
    focusAreas: ["AI", "Technology"],
    avoidTopics: []
  });

  const [customInstructions, setCustomInstructions] = useState("");
  const [newFocusArea, setNewFocusArea] = useState("");
  const [newAvoidTopic, setNewAvoidTopic] = useState("");

  const handleSave = () => {
    // In real app, save to backend
    toast({ title: "Saved", description: "Personalization settings saved successfully" });
  };

  const handleReset = () => {
    setSettings({
      tone: "professional",
      responseLength: "moderate",
      creativity: 50,
      language: "en",
      autoSuggest: true,
      includeEmojis: false,
      codeStyle: "commented",
      citationStyle: "inline",
      focusAreas: [],
      avoidTopics: []
    });
    setCustomInstructions("");
    toast({ title: "Reset", description: "Settings reset to defaults" });
  };

  const addFocusArea = () => {
    if (newFocusArea && !settings.focusAreas.includes(newFocusArea)) {
      setSettings(prev => ({ ...prev, focusAreas: [...prev.focusAreas, newFocusArea] }));
      setNewFocusArea("");
    }
  };

  const addAvoidTopic = () => {
    if (newAvoidTopic && !settings.avoidTopics.includes(newAvoidTopic)) {
      setSettings(prev => ({ ...prev, avoidTopics: [...prev.avoidTopics, newAvoidTopic] }));
      setNewAvoidTopic("");
    }
  };

  return (
    <>
      <Helmet>
        <title>Personalization - Proxinex</title>
        <meta name="description" content="Customize how Proxinex AI responds to you." />
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
              const isActive = item.path === "/app/settings";
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
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Personalization</h1>
                  <p className="text-sm text-muted-foreground">Customize how Proxinex AI responds to you</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleReset} className="border-border">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleSave} className="bg-primary text-primary-foreground">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Response Style */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Response Style</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Tone */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Communication Tone</label>
                  <Select value={settings.tone} onValueChange={(v) => setSettings(prev => ({ ...prev, tone: v as any }))}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(toneDescriptions).map(([key, desc]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex flex-col">
                            <span className="capitalize">{key}</span>
                            <span className="text-xs text-muted-foreground">{desc}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Response Length */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Response Length</label>
                  <Select value={settings.responseLength} onValueChange={(v) => setSettings(prev => ({ ...prev, responseLength: v as any }))}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brief">Brief - Quick answers</SelectItem>
                      <SelectItem value="moderate">Moderate - Balanced</SelectItem>
                      <SelectItem value="detailed">Detailed - Thorough</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive - In-depth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    <Globe className="h-4 w-4 inline mr-2" />
                    Preferred Language
                  </label>
                  <Select value={settings.language} onValueChange={(v) => setSettings(prev => ({ ...prev, language: v }))}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="hi">हिन्दी</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Citation Style */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Citation Style</label>
                  <Select value={settings.citationStyle} onValueChange={(v) => setSettings(prev => ({ ...prev, citationStyle: v as any }))}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inline">Inline citations</SelectItem>
                      <SelectItem value="footnotes">Footnotes</SelectItem>
                      <SelectItem value="none">No citations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Creativity & Behavior */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Creativity & Behavior</h2>
              </div>

              <div className="space-y-6">
                {/* Creativity Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">Creativity Level</label>
                    <span className="text-sm text-muted-foreground">{settings.creativity}%</span>
                  </div>
                  <Slider
                    value={[settings.creativity]}
                    onValueChange={([v]) => setSettings(prev => ({ ...prev, creativity: v }))}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Factual</span>
                    <span>Balanced</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">Auto-suggest follow-ups</p>
                      <p className="text-xs text-muted-foreground">Show related query suggestions</p>
                    </div>
                    <Switch
                      checked={settings.autoSuggest}
                      onCheckedChange={(v) => setSettings(prev => ({ ...prev, autoSuggest: v }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">Include emojis</p>
                      <p className="text-xs text-muted-foreground">Add emojis to responses</p>
                    </div>
                    <Switch
                      checked={settings.includeEmojis}
                      onCheckedChange={(v) => setSettings(prev => ({ ...prev, includeEmojis: v }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Code Preferences */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Code className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Code Preferences</h2>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Code Comment Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "minimal", label: "Minimal", desc: "Code only, few comments" },
                    { value: "commented", label: "Commented", desc: "Helpful inline comments" },
                    { value: "documented", label: "Documented", desc: "Full documentation" }
                  ].map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setSettings(prev => ({ ...prev, codeStyle: style.value as any }))}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        settings.codeStyle === style.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="font-medium text-foreground">{style.label}</p>
                      <p className="text-xs text-muted-foreground">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Focus Areas */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <BookMarked className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Focus Areas & Preferences</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Focus Areas */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Topics I'm interested in</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newFocusArea}
                      onChange={(e) => setNewFocusArea(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addFocusArea()}
                      placeholder="Add a topic..."
                      className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm"
                    />
                    <Button size="sm" onClick={addFocusArea} className="bg-primary text-primary-foreground">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {settings.focusAreas.map((area) => (
                      <Badge
                        key={area}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive/20"
                        onClick={() => setSettings(prev => ({ ...prev, focusAreas: prev.focusAreas.filter(a => a !== area) }))}
                      >
                        {area} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Avoid Topics */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Topics to avoid</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newAvoidTopic}
                      onChange={(e) => setNewAvoidTopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addAvoidTopic()}
                      placeholder="Add a topic..."
                      className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm"
                    />
                    <Button size="sm" onClick={addAvoidTopic} className="bg-primary text-primary-foreground">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {settings.avoidTopics.map((topic) => (
                      <Badge
                        key={topic}
                        variant="outline"
                        className="cursor-pointer hover:bg-destructive/20 border-destructive/50 text-destructive"
                        onClick={() => setSettings(prev => ({ ...prev, avoidTopics: prev.avoidTopics.filter(t => t !== topic) }))}
                      >
                        {topic} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Instructions */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sliders className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Custom Instructions</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Add specific instructions for how Proxinex should respond. These will be applied to all conversations.
              </p>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Example: Always provide code examples in TypeScript. Explain concepts using analogies..."
                className="w-full h-32 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {customInstructions.length}/1000 characters
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PersonalizationPage;
