import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
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
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used?: string;
  requests_count: number;
}

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
      // If table doesn't exist yet, just show empty state
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
      toast({
        title: "Error",
        description: "Please enter a name for the API key",
        variant: "destructive",
      });
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
      toast({
        title: "API Key Created",
        description: "Your new API key has been created. Make sure to copy it now!",
      });
    } catch (error) {
      console.error("Error creating API key:", error);
      toast({
        title: "Error",
        description: "Failed to create API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteKey = async () => {
    if (!deleteKeyId) return;

    try {
      const { error } = await supabase.from("api_keys").delete().eq("id", deleteKeyId);
      if (error) throw error;

      setApiKeys(apiKeys.filter((k) => k.id !== deleteKeyId));
      toast({
        title: "API Key Deleted",
        description: "The API key has been permanently deleted.",
      });
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteKeyId(null);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const maskKey = (key: string) => {
    return key.substring(0, 7) + "•".repeat(20) + key.substring(key.length - 4);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Helmet>
        <title>API Keys - Proxinex</title>
        <meta name="description" content="Manage your Proxinex API keys for programmatic access" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Key className="h-8 w-8 text-primary" />
                API Keys
              </h1>
              <p className="text-muted-foreground mt-1">
                Create and manage API keys for programmatic access to Proxinex
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Key
            </Button>
          </div>

          {/* Warning Banner */}
          <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-8">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-500">Keep your API keys secure</p>
              <p className="text-muted-foreground">
                Do not share your API keys publicly or expose them in client-side code. 
                Rotate keys regularly and delete unused ones.
              </p>
            </div>
          </div>

          {/* API Keys List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-lg">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No API keys yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first API key to start using the Proxinex API
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-foreground">{apiKey.name}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <code className="flex-1 text-sm bg-secondary/50 px-3 py-1.5 rounded font-mono text-muted-foreground truncate">
                          {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {visibleKeys.has(apiKey.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedId === apiKey.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
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
                        {apiKey.last_used && (
                          <span>Last used {formatDate(apiKey.last_used)}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteKeyId(apiKey.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* API Documentation Link */}
          <div className="mt-8 p-6 bg-card border border-border rounded-lg">
            <h3 className="font-medium text-foreground mb-2">Getting Started</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use your API key in the Authorization header to authenticate requests:
            </p>
            <code className="block p-3 bg-secondary/50 rounded text-sm font-mono text-muted-foreground overflow-x-auto">
              curl -H "Authorization: Bearer px_YOUR_API_KEY" \<br />
              &nbsp;&nbsp;https://api.proxinex.com/v1/research
            </code>
          </div>
        </div>
      </div>

      {/* Create Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) {
          setNewKeyName("");
          setCreatedKey(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{createdKey ? "API Key Created" : "Create New API Key"}</DialogTitle>
            <DialogDescription>
              {createdKey 
                ? "Your API key has been created. Copy it now—you won't be able to see it again!"
                : "Give your API key a name to help you identify it later."
              }
            </DialogDescription>
          </DialogHeader>

          {createdKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <code className="text-sm font-mono text-foreground break-all">{createdKey}</code>
              </div>
              <Button 
                onClick={() => copyToClipboard(createdKey, "new")}
                className="w-full gap-2"
              >
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
                  placeholder="e.g., Production, Development, Testing"
                  className="w-full mt-2 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateKey} disabled={!newKeyName.trim()}>
                  Create Key
                </Button>
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
              This action cannot be undone. Any applications using this key will lose access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteKey} className="bg-red-500 hover:bg-red-600">
              Delete Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ApiKeysPage;
