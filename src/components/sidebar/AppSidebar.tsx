import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  LogOut,
  User,
  Star,
  PanelLeftClose,
  PanelLeft,
  Pin,
  ChevronDown,
  Wand2,
  Beaker,
  Lock,
  History,
} from "lucide-react";
import { useUserPlan, UserPlan } from "@/hooks/useUserPlan";

interface ChatSession {
  id: string;
  title: string;
  isStarred?: boolean;
  isResearch?: boolean;
}

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  user?: { email?: string } | null;
  onSignOut?: () => void;
  chatSessions?: ChatSession[];
  activeSessionId?: string | null;
  onSelectSession?: (sessionId: string) => void;
  onNewSession?: () => void;
}

type FeatureKey = "chat" | "research" | "documents" | "notebooks" | "images" | "video" | "sandbox" | "apiPlayground";

interface NavItem {
  icon: any;
  label: string;
  path: string;
  isNew?: boolean;
  hasDropdown?: boolean;
  feature?: FeatureKey;
}

// Primary actions - always visible
const primaryItems: NavItem[] = [
  { icon: Plus, label: "New Session", path: "/app", isNew: true },
  { icon: MessageSquare, label: "Chat", path: "/app/chat", hasDropdown: true, feature: "chat" },
  { icon: Search, label: "Research", path: "/app/research", feature: "research" },
];

// Create section - content generation tools
const createItems: NavItem[] = [
  { icon: FileText, label: "Documents", path: "/app/documents", feature: "documents" },
  { icon: Image, label: "Images", path: "/app/images", feature: "images" },
  { icon: Video, label: "Video", path: "/app/video", feature: "video" },
];

// Advanced section - power user tools
const advancedItems: NavItem[] = [
  { icon: Layers, label: "Sandbox", path: "/app/sandbox", feature: "sandbox" },
  { icon: BookOpen, label: "Notebooks", path: "/app/notebooks", feature: "notebooks" },
  { icon: Code, label: "API Playground", path: "/app/api", feature: "apiPlayground" },
];

// Organization section
const orgItems: NavItem[] = [
  { icon: Star, label: "Projects", path: "/app/projects" },
  { icon: Pin, label: "Pinned", path: "/app/pinned" },
];

// Settings section
const settingsItems: NavItem[] = [
  { icon: BarChart3, label: "Usage & Cost", path: "/app/usage" },
  { icon: Key, label: "API Keys", path: "/app/api-keys" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
];

export const AppSidebar = ({
  collapsed,
  onToggleCollapse,
  user,
  onSignOut,
  chatSessions = [],
  activeSessionId,
  onSelectSession,
  onNewSession,
}: AppSidebarProps) => {
  const location = useLocation();
  const [historyOpen, setHistoryOpen] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const { isFeatureAvailable, getUpgradeHint, getRequiredPlan } = useUserPlan();

  const isActive = (path: string) => location.pathname === path;

  // Separate chat and research sessions
  const chatOnlySessions = chatSessions.filter(s => !s.isResearch);
  const researchSessions = chatSessions.filter(s => s.isResearch);

  const renderLockedItem = (item: NavItem, Icon: any, active: boolean) => {
    const requiredPlan = getRequiredPlan(item.feature!);
    const hint = getUpgradeHint(item.feature!);

    return (
      <Tooltip key={item.path}>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg cursor-not-allowed opacity-60 ${
              active
                ? "bg-sidebar-accent/50"
                : "text-sidebar-foreground"
            }`}
          >
            <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            {!collapsed && (
              <>
                <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px]">
          <p className="text-xs">{hint}</p>
          <Link 
            to="/pricing" 
            className="text-xs text-primary hover:underline mt-1 block"
          >
            View {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Plan →
          </Link>
        </TooltipContent>
      </Tooltip>
    );
  };

  const renderNavItem = (item: NavItem, index: number) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    const isNewSession = item.isNew;
    const hasDropdown = item.hasDropdown;

    // Check if feature is locked
    if (item.feature && !isFeatureAvailable(item.feature)) {
      return renderLockedItem(item, Icon, active);
    }

    // Render Chat item with collapsible history dropdown
    if (hasDropdown && !collapsed) {
      return (
        <Collapsible
          key={item.path}
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          className="mx-2"
        >
          <CollapsibleTrigger className="w-full">
            <div
              className={`flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <History className={`h-5 w-5 flex-shrink-0 ${active ? "text-primary" : ""}`} />
              <span className="text-sm flex-1 text-left">History</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${historyOpen ? "rotate-180" : ""}`}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 space-y-1">
            {/* Chat Sessions */}
            {chatOnlySessions.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Chat
                </div>
                {chatOnlySessions.slice(0, 3).map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSelectSession?.(session.id)}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-md truncate transition-colors flex items-center gap-2 ${
                      activeSessionId === session.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <MessageSquare className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{session.title.slice(0, 20)}{session.title.length > 20 ? "..." : ""}</span>
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Chat</span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Research Sessions */}
            {researchSessions.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Research
                </div>
                {researchSessions.slice(0, 3).map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSelectSession?.(session.id)}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-md truncate transition-colors flex items-center gap-2 ${
                      activeSessionId === session.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <Search className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{session.title.slice(0, 20)}{session.title.length > 20 ? "..." : ""}</span>
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">Research</span>
                  </button>
                ))}
              </div>
            )}
            
            {chatSessions.length > 6 && (
              <Link
                to="/app/chat"
                className="block px-3 py-1.5 text-xs text-primary hover:underline"
              >
                View all {chatSessions.length} sessions →
              </Link>
            )}
            {chatSessions.length === 0 && (
              <div className="px-3 py-1.5 text-xs text-muted-foreground">No history yet</div>
            )}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={isNewSession ? onNewSession : undefined}
        className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors ${
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
        } ${isNewSession ? "border border-primary/50" : ""}`}
      >
        <Icon
          className={`h-5 w-5 flex-shrink-0 ${isNewSession ? "text-primary" : active ? "text-primary" : ""}`}
        />
        {!collapsed && <span className="text-sm">{item.label}</span>}
      </Link>
    );
  };

  const renderCollapsibleSection = (
    label: string,
    icon: any,
    items: NavItem[],
    isOpen: boolean,
    setIsOpen: (open: boolean) => void
  ) => {
    const Icon = icon;
    const hasActiveChild = items.some((item) => isActive(item.path));

    if (collapsed) {
      return (
        <div key={label} className="space-y-1">
          {items.map((item) => {
            const ItemIcon = item.icon;
            const active = isActive(item.path);
            const isLocked = item.feature && !isFeatureAvailable(item.feature);
            
            if (isLocked) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <div
                      className="flex items-center justify-center py-2.5 mx-2 rounded-lg cursor-not-allowed opacity-60"
                      title={item.label}
                    >
                      <ItemIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="text-xs">{getUpgradeHint(item.feature!)}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center py-2.5 mx-2 rounded-lg transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
                title={item.label}
              >
                <ItemIcon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
              </Link>
            );
          })}
        </div>
      );
    }

    return (
      <Collapsible
        key={label}
        open={isOpen || hasActiveChild}
        onOpenChange={setIsOpen}
        className="mx-2"
      >
        <CollapsibleTrigger className="w-full">
          <div
            className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 ${
              hasActiveChild ? "text-primary" : ""
            }`}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-medium uppercase tracking-wider flex-1 text-left opacity-70">
              {label}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform opacity-50 ${isOpen || hasActiveChild ? "rotate-180" : ""}`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 space-y-0.5 ml-2">
          {items.map((item) => {
            const ItemIcon = item.icon;
            const active = isActive(item.path);
            const isLocked = item.feature && !isFeatureAvailable(item.feature);
            
            if (isLocked) {
              return renderLockedItem(item, ItemIcon, active);
            }
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <ItemIcon className={`h-4 w-4 flex-shrink-0 ${active ? "text-primary" : ""}`} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} border-r border-border bg-sidebar flex flex-col flex-shrink-0 transition-all duration-300`}
    >
      {/* Header with Logo */}
      <div className="h-14 border-b border-sidebar-border flex items-center justify-between px-3 flex-shrink-0">
        <Link to="/" className={collapsed ? "mx-auto" : ""}>
          <Logo size="sm" showText={!collapsed} />
        </Link>
        <button
          onClick={onToggleCollapse}
          className={`p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors ${collapsed ? "hidden" : ""}`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggleCollapse}
          className="p-2 mx-auto mt-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          title="Expand sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      )}

      <nav className="flex-1 py-4 overflow-y-auto space-y-1">
        {/* Primary Actions */}
        <div className="space-y-1">
          {primaryItems.map((item, index) => renderNavItem(item, index))}
        </div>

        {/* Divider */}
        <div className="my-3 mx-4 border-t border-sidebar-border" />

        {/* Create Section */}
        {renderCollapsibleSection("Create", Wand2, createItems, createOpen, setCreateOpen)}

        {/* Advanced Section */}
        {renderCollapsibleSection("Advanced", Beaker, advancedItems, advancedOpen, setAdvancedOpen)}

        {/* Divider */}
        <div className="my-3 mx-4 border-t border-sidebar-border" />

        {/* Organization */}
        <div className="space-y-1">
          {orgItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${active ? "text-primary" : ""}`} />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-3 mx-4 border-t border-sidebar-border" />

        {/* Settings */}
        <div className="space-y-1">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${active ? "text-primary" : ""}`} />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      {!collapsed && user && (
        <div className="p-4 border-t border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      )}
    </aside>
  );
};
