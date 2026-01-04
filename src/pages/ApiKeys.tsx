import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  Check,
  AlertTriangle,
  Clock,
  Activity,
  ArrowLeft,
  Book,
  Code,
  CreditCard,
  Zap,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used?: string;
  requests_count: number;
}

const pricingTiers = [
  { model: "GPT-4o", input: "$2.50", output: "$10.00", context: "128K" },
  { model: "GPT-4o Mini", input: "$0.15", output: "$0.60", context: "128K" },
  { model: "Claude 3.5 Sonnet", input: "$3.00", output: "$15.00", context: "200K" },
  { model: "Gemini 1.5 Pro", input: "$1.25", output: "$5.00", context: "1M" },
  { model: "Llama 3.1 70B", input: "$0.35", output: "$0.40", context: "128K" },
];

const ApiKeysPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("keys");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadApiKeys();
  }, [user, navigate]);

  const loadApiKeys = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error("Error loading API keys:", error);
      setApiKeys([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateApiKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const prefix = "px_";
    let key = prefix;
    for (let i = 0; i < 48; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast({ title: "Error", description: "Please enter a name for the API key", variant: "destructive" });
      return;
    }

    const newKey = generateApiKey();
    
    try {
      const { error } = await supabase.from("api_keys").insert({
        name: newKeyName.trim(),
        key: newKey,
        user_id: user?.id,
        requests_count: 0,
      });

      if (error) throw error;

      setCreatedKey(newKey);
      loadApiKeys();
      toast({ title: "API Key Created", description: "Make sure to copy it now!" });
    } catch (error) {
      console.error("Error creating API key:", error);
      toast({ title: "Error", description: "Failed to create API key", variant: "destructive" });
    }
  };

  const handleDeleteKey = async () => {
    if (!deleteKeyId) return;

    try {
      const { error } = await supabase.from("api_keys").delete().eq("id", deleteKeyId);
      if (error) throw error;

      setApiKeys(apiKeys.filter((k) => k.id !== deleteKeyId));
      toast({ title: "API Key Deleted" });
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast({ title: "Error", description: "Failed to delete API key", variant: "destructive" });
    } finally {
      setDeleteKeyId(null);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied", description: "API key copied to clipboard" });
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const maskKey = (key: string) => {
    return key.substring(0, 7) + "•".repeat(20) + key.substring(key.length - 4);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  return (
    <>
      <Helmet>
        <title>API Keys - Proxinex</title>
        <meta name="description" content="Manage your Proxinex API keys for programmatic access" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/app" className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Link>
                <div>
                  <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    API Keys
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Manage API keys and view documentation
                  </p>
                </div>
              </div>
              <ThemeToggle />
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Key
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-lg grid-cols-4 mb-8">
              <TabsTrigger value="keys" className="gap-2">
                <Key className="h-4 w-4" />
                Keys
              </TabsTrigger>
              <TabsTrigger value="docs" className="gap-2">
                <Book className="h-4 w-4" />
                Docs
              </TabsTrigger>
              <TabsTrigger value="guides" className="gap-2">
                <Code className="h-4 w-4" />
                Guides
              </TabsTrigger>
              <TabsTrigger value="pricing" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Pricing
              </TabsTrigger>
            </TabsList>

            {/* Keys Tab */}
            <TabsContent value="keys">
              {/* Warning Banner */}
              <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-500">Keep your API keys secure</p>
                  <p className="text-muted-foreground">
                    Do not share your API keys publicly or expose them in client-side code.
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : apiKeys.length === 0 ? (
                <Card className="py-16">
                  <div className="text-center">
                    <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No API keys yet</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Create your first API key to start using the Proxinex API
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Key
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <Card key={apiKey.id} className="hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground mb-2">{apiKey.name}</h3>
                            <div className="flex items-center gap-2 mb-3">
                              <code className="flex-1 text-sm bg-secondary/50 px-3 py-1.5 rounded font-mono text-muted-foreground truncate">
                                {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                              </code>
                              <button onClick={() => toggleKeyVisibility(apiKey.id)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                                {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                              <button onClick={() => copyToClipboard(apiKey.key, apiKey.id)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                                {copiedId === apiKey.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                              </button>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Created {formatDate(apiKey.created_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                {apiKey.requests_count.toLocaleString()} requests
                              </span>
                            </div>
                          </div>
                          <button onClick={() => setDeleteKeyId(apiKey.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Docs Tab */}
            <TabsContent value="docs">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Start</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Use your API key to authenticate requests to the Proxinex API.
                    </p>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Authentication</h4>
                      <code className="block p-4 bg-secondary rounded-lg text-sm font-mono overflow-x-auto">
                        curl -H "Authorization: Bearer px_YOUR_API_KEY" \<br />
                        &nbsp;&nbsp;https://api.proxinex.com/v1/research
                      </code>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Example Request</h4>
                      <code className="block p-4 bg-secondary rounded-lg text-sm font-mono overflow-x-auto">
{`curl -X POST https://api.proxinex.com/v1/chat \\
  -H "Authorization: Bearer px_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "model": "auto"
  }'`}
                      </code>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Endpoints</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { method: "POST", path: "/v1/chat", desc: "Send a message to the AI" },
                      { method: "POST", path: "/v1/research", desc: "Deep research with sources" },
                      { method: "POST", path: "/v1/images/generate", desc: "Generate images" },
                      { method: "POST", path: "/v1/videos/generate", desc: "Generate videos" },
                      { method: "GET", path: "/v1/usage", desc: "Get usage statistics" },
                    ].map((endpoint, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <Badge variant={endpoint.method === "GET" ? "secondary" : "default"}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono">{endpoint.path}</code>
                        <span className="text-sm text-muted-foreground ml-auto">{endpoint.desc}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Guides Tab */}
            <TabsContent value="guides">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Getting Started", desc: "Learn the basics of the Proxinex API", icon: Zap },
                  { title: "Authentication", desc: "Secure your API requests", icon: Key },
                  { title: "Rate Limits", desc: "Understand usage limits and quotas", icon: Activity },
                  { title: "Error Handling", desc: "Handle errors gracefully", icon: AlertTriangle },
                  { title: "SDKs & Libraries", desc: "Use our official client libraries", icon: Code },
                  { title: "Best Practices", desc: "Optimize your API usage", icon: Book },
                ].map((guide, i) => (
                  <Card key={i} className="hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <guide.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium group-hover:text-primary transition-colors">{guide.title}</h3>
                          <p className="text-sm text-muted-foreground">{guide.desc}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Metered Billing</CardTitle>
                    <Badge variant="secondary">Pay as you go</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    All usage is tracked and billed per 1M tokens for text models
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 font-medium">Model</th>
                          <th className="text-right py-3 font-medium">Input (1M tokens)</th>
                          <th className="text-right py-3 font-medium">Output (1M tokens)</th>
                          <th className="text-right py-3 font-medium">Context</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricingTiers.map((tier, i) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="py-3 font-medium">{tier.model}</td>
                            <td className="py-3 text-right text-muted-foreground">{tier.input}</td>
                            <td className="py-3 text-right text-muted-foreground">{tier.output}</td>
                            <td className="py-3 text-right">
                              <Badge variant="outline">{tier.context}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
                    <h4 className="font-medium mb-2">Free Tier Included</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 100 free API requests per month</li>
                      <li>• 10 free image generations per month</li>
                      <li>• 3 free video generations per month</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) { setNewKeyName(""); setCreatedKey(null); }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{createdKey ? "API Key Created" : "Create New API Key"}</DialogTitle>
            <DialogDescription>
              {createdKey 
                ? "Copy it now—you won't be able to see it again!"
                : "Give your API key a name to identify it later."}
            </DialogDescription>
          </DialogHeader>

          {createdKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <code className="text-sm font-mono text-foreground break-all">{createdKey}</code>
              </div>
              <Button onClick={() => copyToClipboard(createdKey, "new")} className="w-full gap-2">
                {copiedId === "new" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedId === "new" ? "Copied!" : "Copy to Clipboard"}
              </Button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-foreground">Key Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production, Development"
                  className="w-full mt-2 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateKey} disabled={!newKeyName.trim()}>Create Key</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteKeyId} onOpenChange={() => setDeleteKeyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Applications using this key will lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteKey} className="bg-destructive hover:bg-destructive/90">
              Delete Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ApiKeysPage;
