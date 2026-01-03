import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Bell,
  Shield,
  Zap,
  Settings as SettingsIcon,
  Crown,
  ArrowLeft,
  Mail,
  Key,
  Globe,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Laptop,
  LogOut,
  Trash2,
  Download,
  CreditCard,
  ChevronRight,
  Check,
  ExternalLink,
  Plug,
  Slack,
  FileText,
  Calendar,
  Database,
  Cloud,
  MessageSquare,
  BookOpen,
  HelpCircle,
  FileCode,
  AlertTriangle,
  Keyboard
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Connector definitions
export const connectors = [
  { 
    id: "slack", 
    name: "Slack", 
    icon: MessageSquare, 
    connected: false, 
    description: "Get notifications and ask questions directly from Slack",
    category: "Communication"
  },
  { 
    id: "notion", 
    name: "Notion", 
    icon: FileText, 
    connected: true, 
    description: "Search and reference your Notion workspace",
    category: "Productivity"
  },
  { 
    id: "google-drive", 
    name: "Google Drive", 
    icon: Cloud, 
    connected: false, 
    description: "Access and analyze files from Google Drive",
    category: "Storage"
  },
  { 
    id: "github", 
    name: "GitHub", 
    icon: FileCode, 
    connected: true, 
    description: "Search repositories, issues, and code",
    category: "Development"
  },
  { 
    id: "confluence", 
    name: "Confluence", 
    icon: BookOpen, 
    connected: false, 
    description: "Access company documentation and wikis",
    category: "Productivity"
  },
  { 
    id: "jira", 
    name: "Jira", 
    icon: Calendar, 
    connected: false, 
    description: "Search and manage Jira tickets",
    category: "Development"
  },
  { 
    id: "linear", 
    name: "Linear", 
    icon: Zap, 
    connected: false, 
    description: "Search issues and projects in Linear",
    category: "Development"
  },
  { 
    id: "dropbox", 
    name: "Dropbox", 
    icon: Database, 
    connected: false, 
    description: "Access files stored in Dropbox",
    category: "Storage"
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    features: ["100 queries/month", "Basic models", "Standard support"],
    current: false,
  },
  {
    name: "Pro",
    price: "$19",
    features: ["Unlimited queries", "All models", "Priority support", "API access"],
    current: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Custom limits", "Dedicated support", "SSO", "Custom integrations"],
    current: false,
  },
];

export default function Settings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
    marketing: false,
  });
  const [appearance, setAppearance] = useState("system");
  const [localConnectors, setLocalConnectors] = useState(connectors);

  const handleConnectorToggle = (connectorId: string) => {
    setLocalConnectors(prev =>
      prev.map(c =>
        c.id === connectorId ? { ...c, connected: !c.connected } : c
      )
    );
    const connector = localConnectors.find(c => c.id === connectorId);
    toast({
      title: connector?.connected ? "Disconnected" : "Connected",
      description: `${connector?.name} has been ${connector?.connected ? "disconnected" : "connected"} successfully.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/app" className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-2xl">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Plan</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="connectors" className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              <span className="hidden sm:inline">Apps</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-semibold">
                    {user?.email?.[0]?.toUpperCase() || "P"}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Photo</Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF up to 5MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="John Doe" defaultValue="" />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input placeholder="@johndoe" defaultValue="" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2">
                    <Input value={user?.email || ""} disabled className="bg-muted" />
                    <Badge variant="secondary" className="shrink-0">Verified</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Input placeholder="A short bio about yourself" />
                </div>

                <Button className="bg-primary text-primary-foreground">Save Changes</Button>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize how Proxinex looks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: "light", label: "Light", icon: Sun },
                    { id: "dark", label: "Dark", icon: Moon },
                    { id: "system", label: "System", icon: Monitor },
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => setAppearance(option.id)}
                      className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                        appearance === option.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <option.icon className={`h-6 w-6 ${appearance === option.id ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm">{option.label}</span>
                      {appearance === option.id && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plan Tab */}
          <TabsContent value="plan" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-primary" />
                      Current Plan
                    </CardTitle>
                    <CardDescription>Manage your subscription</CardDescription>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">Pro</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map(plan => (
                    <div
                      key={plan.name}
                      className={`p-6 rounded-xl border-2 transition-colors ${
                        plan.current
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        {plan.current && <Badge variant="secondary">Current</Badge>}
                      </div>
                      <div className="mb-4">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                      </div>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant={plan.current ? "outline" : "default"}
                        className="w-full"
                        disabled={plan.current}
                      >
                        {plan.current ? "Current Plan" : plan.name === "Enterprise" ? "Contact Sales" : "Upgrade"}
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Usage This Month</h4>
                    <p className="text-sm text-muted-foreground">2,450 / Unlimited queries</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Billing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: "email", label: "Email Notifications", description: "Receive updates via email" },
                  { key: "push", label: "Push Notifications", description: "Browser push notifications" },
                  { key: "updates", label: "Product Updates", description: "New features and improvements" },
                  { key: "marketing", label: "Marketing", description: "Tips, offers, and news" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{item.label}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, [item.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connectors/Apps Tab */}
          <TabsContent value="connectors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="h-5 w-5" />
                  Connected Apps
                </CardTitle>
                <CardDescription>
                  Connect apps to mention them with @ in chat. Type @app_name to reference connected sources.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {localConnectors.map(connector => (
                    <div
                      key={connector.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        connector.connected ? "border-primary/50 bg-primary/5" : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${connector.connected ? "bg-primary/20" : "bg-secondary"}`}>
                          <connector.icon className={`h-5 w-5 ${connector.connected ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{connector.name}</h4>
                            <Badge variant="outline" className="text-xs">{connector.category}</Badge>
                            {connector.connected && (
                              <Badge className="bg-primary/20 text-primary text-xs">Connected</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{connector.description}</p>
                          {connector.connected && (
                            <p className="text-xs text-primary mt-1">Use @{connector.id} in chat to reference</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant={connector.connected ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleConnectorToggle(connector.id)}
                      >
                        {connector.connected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Browse App Directory
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Protect your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-muted-foreground">Update your password regularly</p>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Active Sessions</h4>
                  <div className="space-y-3">
                    {[
                      { device: "MacBook Pro", location: "San Francisco, CA", current: true, icon: Laptop },
                      { device: "iPhone 15", location: "San Francisco, CA", current: false, icon: Smartphone },
                    ].map((session, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex items-center gap-3">
                          <session.icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{session.device}</p>
                            <p className="text-xs text-muted-foreground">{session.location}</p>
                          </div>
                          {session.current && <Badge variant="secondary">Current</Badge>}
                        </div>
                        {!session.current && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Rate Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  API Rate Limits
                </CardTitle>
                <CardDescription>Your current API usage limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Requests per minute", current: 60, max: 100 },
                  { label: "Requests per day", current: 8500, max: 10000 },
                  { label: "Concurrent connections", current: 5, max: 10 },
                ].map((limit, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{limit.label}</span>
                      <span className="text-sm text-muted-foreground">{limit.current} / {limit.max}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(limit.current / limit.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Keyboard Shortcuts
                </CardTitle>
                <CardDescription>Quick actions for power users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { action: "New Chat", shortcut: "⌘ N" },
                  { action: "Search", shortcut: "⌘ K" },
                  { action: "Toggle Sidebar", shortcut: "⌘ B" },
                  { action: "Settings", shortcut: "⌘ ," },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <span className="text-sm">{item.action}</span>
                    <kbd className="px-2 py-1 bg-secondary text-muted-foreground text-xs rounded">{item.shortcut}</kbd>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Data & Privacy
                </CardTitle>
                <CardDescription>Manage your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-between">
                  <span>Export All Data</span>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between text-destructive hover:text-destructive">
                  <span>Delete All Chat History</span>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Sign Out Everywhere</h4>
                    <p className="text-sm text-muted-foreground">Sign out from all devices</p>
                  </div>
                  <Button variant="outline" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-destructive">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex gap-3 justify-end">
                        <Button variant="outline">Cancel</Button>
                        <Button variant="destructive">Delete Forever</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
