import { useState, useCallback, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  PenLine,
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
  ChevronsLeft,
  ChevronsRight,
  PanelLeft,
  Pin,
  ChevronDown,
  ChevronUp,
  Wand2,
  Beaker,
  Lock,
  History,
  Sparkles,
  Crown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Archive,
  Share2,
  Download,
} from "lucide-react";
import { useUserPlan, UserPlan } from "@/hooks/useUserPlan";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { pinColors, PinColor } from "@/components/chat/PinColorSelector";
import { DraggablePinnedSession } from "./DraggablePinnedSession";

interface ChatSession {
  id: string;
  title: string;
  isStarred?: boolean;
  isPinned?: boolean;
  isResearch?: boolean;
  pinColor?: PinColor;
}

interface InlineAskItem {
  id: string;
  highlighted_text: string;
  question: string;
  created_at: string;
  session_id?: string;
  is_pinned?: boolean;
  is_archived?: boolean;
  pin_color?: PinColor;
  title?: string;
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
  onDeleteSession?: (sessionId: string) => void;
  onRenameSession?: (sessionId: string, newTitle: string) => void;
  onPinSession?: (sessionId: string) => void;
  onArchiveSession?: (sessionId: string) => void;
  onShareSession?: (sessionId: string) => void;
  onReorderPinnedSessions?: (sessions: ChatSession[]) => void;
  inlineAsks?: InlineAskItem[];
  onSelectInlineAsk?: (askId: string, sessionId?: string) => void;
  onDeleteInlineAsk?: (askId: string) => void;
  onRenameInlineAsk?: (askId: string, question: string) => void;
  onPinInlineAsk?: (askId: string) => void;
  onArchiveInlineAsk?: (askId: string) => void;
  onShareInlineAsk?: (askId: string) => void;
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
  { icon: PenLine, label: "New Chat", path: "/app", isNew: true },
  { icon: MessageSquare, label: "Chat", path: "/app/chat", hasDropdown: true, feature: "chat" },
  { icon: Search, label: "Research", path: "/app/research", feature: "research" },
  { icon: Layers, label: "Projects", path: "/app/projects" },
];

// Create section - content generation tools (metered for free plan)
const createItems: NavItem[] = [
  { icon: FileText, label: "Documents", path: "/app/documents", feature: "documents" },
  { icon: Image, label: "Images", path: "/app/images", feature: "images" },
  { icon: Video, label: "Video", path: "/app/video", feature: "video" },
];

// Advanced section - power user tools (metered for free plan)
const advancedItems: NavItem[] = [
  { icon: Layers, label: "Sandbox", path: "/app/sandbox", feature: "sandbox" },
  { icon: BookOpen, label: "Notebooks", path: "/app/notebooks", feature: "notebooks" },
  { icon: Code, label: "API Playground", path: "/app/api", feature: "apiPlayground" },
  { icon: Brain, label: "Memorix", path: "/app/memorix", isNew: true },
];

const planLabels: Record<UserPlan, { label: string; color: string; icon: any }> = {
  free: { label: "Free", color: "bg-muted text-muted-foreground", icon: null },
  go: { label: "Go", color: "bg-primary/20 text-primary", icon: Sparkles },
  pro: { label: "Pro", color: "bg-amber-500/20 text-amber-600 dark:text-amber-400", icon: Crown },
};

export const AppSidebar = ({
  collapsed,
  onToggleCollapse,
  user,
  onSignOut,
  chatSessions = [],
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onPinSession,
  onArchiveSession,
  onShareSession,
  onReorderPinnedSessions,
  inlineAsks = [],
  onSelectInlineAsk,
  onDeleteInlineAsk,
  onRenameInlineAsk,
  onPinInlineAsk,
  onArchiveInlineAsk,
  onShareInlineAsk,
}: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [historyOpen, setHistoryOpen] = useState(true);
  const [chatHistoryExpanded, setChatHistoryExpanded] = useState(true);
  const [researchHistoryExpanded, setResearchHistoryExpanded] = useState(true);
  const [inlineAsksExpanded, setInlineAsksExpanded] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const { plan, isFeatureAvailable, getUpgradeHint, getRequiredPlan } = useUserPlan();
  const { limits, getUsageDisplay, getRemainingUsage } = useUsageLimits();

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile && !collapsed) {
      onToggleCollapse();
    }
  }, [isMobile]);

  const currentPlan = planLabels[plan];
  const PlanIcon = currentPlan.icon;

  const isActive = (path: string) => location.pathname === path;

  // Separate pinned and regular sessions
  const pinnedSessions = chatSessions.filter(s => s.isPinned);
  const regularSessions = chatSessions.filter(s => !s.isPinned);
  
  // Sort regular sessions by starred first
  const sortedRegularSessions = [...regularSessions].sort((a, b) => {
    if (a.isStarred && !b.isStarred) return -1;
    if (!a.isStarred && b.isStarred) return 1;
    return 0;
  });
  
  const chatOnlySessions = sortedRegularSessions.filter(s => !s.isResearch);
  const researchSessions = sortedRegularSessions.filter(s => s.isResearch);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = pinnedSessions.findIndex((s) => s.id === active.id);
      const newIndex = pinnedSessions.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(pinnedSessions, oldIndex, newIndex);
      onReorderPinnedSessions?.(reordered);
    }
  }, [pinnedSessions, onReorderPinnedSessions]);

  const getPinColorConfig = (color?: PinColor) => {
    return pinColors.find((c) => c.id === (color || "primary")) || pinColors[0];
  };
  
  const renderSessionItem = (session: ChatSession, isResearch: boolean) => {
    const colorConfig = getPinColorConfig(session.pinColor);
    
    return (
      <div
        key={session.id}
        className={`group flex items-center w-full text-left px-2 py-2 text-xs rounded-md transition-colors ${
          activeSessionId === session.id
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        }`}
      >
        <button
          onClick={() => onSelectSession?.(session.id)}
          className="flex items-center gap-2.5 flex-1 min-w-0"
        >
          {isResearch ? (
            <Search className="h-3.5 w-3.5 flex-shrink-0" />
          ) : (
            <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
          )}
          <span className="truncate flex-1 text-left leading-tight">{session.title.slice(0, 20)}{session.title.length > 20 ? "..." : ""}</span>
        </button>
        
        {/* Status icons container - fixed width for alignment */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
          {/* Colored Pin Icon */}
          {session.isPinned && (
            <Pin className={`h-3 w-3 ${colorConfig.text} ${colorConfig.fill}`} />
          )}
          
          {/* Star Icon */}
          {session.isStarred && !session.isPinned && (
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          )}
          
          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-secondary rounded transition-opacity">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => onRenameSession?.(session.id, session.title)}>
                <Pencil className="h-3 w-3 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPinSession?.(session.id)}>
                <Pin className={`h-3 w-3 mr-2 ${session.isPinned ? colorConfig.fill + " " + colorConfig.text : ""}`} />
                {session.isPinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShareSession?.(session.id)}>
                <Share2 className="h-3 w-3 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchiveSession?.(session.id)}>
                <Archive className="h-3 w-3 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDeleteSession?.(session.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  const renderLockedItem = (item: NavItem, Icon: any, active: boolean) => {
    const requiredPlan = getRequiredPlan(item.feature!);
    const hint = getUpgradeHint(item.feature!);

    return (
      <Tooltip key={item.path}>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-not-allowed opacity-60 ${
              active
                ? "bg-sidebar-accent/50"
                : "text-sidebar-foreground"
            }`}
          >
            <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            {!collapsed && (
              <>
                <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
                <Lock className="h-3 w-3 text-muted-foreground" />
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px]">
          <p className="text-xs">{hint}</p>
          <button 
            onClick={() => setUpgradeModalOpen(true)}
            className="text-xs text-primary hover:underline mt-1 block"
          >
            Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} →
          </button>
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
          <CollapsibleContent className="mt-1 space-y-1 px-1">
            {/* Pinned Sessions with Drag & Drop */}
            {pinnedSessions.length > 0 && (
              <div className="mb-3">
                <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Pin className="h-3 w-3" />
                  Pinned
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={pinnedSessions.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {pinnedSessions.map((session) => (
                      <DraggablePinnedSession
                        key={session.id}
                        session={session}
                        isActive={activeSessionId === session.id}
                        onSelect={onSelectSession || (() => {})}
                        onRename={onRenameSession}
                        onPin={onPinSession}
                        onShare={onShareSession}
                        onArchive={onArchiveSession}
                        onDelete={onDeleteSession}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* Chat Sessions - Collapsible */}
            {chatOnlySessions.length > 0 && (
              <Collapsible open={chatHistoryExpanded} onOpenChange={setChatHistoryExpanded} className="mb-2">
                <CollapsibleTrigger className="w-full">
                  <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 hover:bg-secondary/30 rounded transition-colors">
                    <MessageSquare className="h-3 w-3" />
                    <span className="flex-1 text-left">Chat ({chatOnlySessions.length})</span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${chatHistoryExpanded ? "rotate-180" : ""}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 space-y-0.5">
                  {chatOnlySessions.slice(0, 6).map((session) => renderSessionItem(session, false))}
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {/* Research Sessions - Collapsible */}
            {researchSessions.length > 0 && (
              <Collapsible open={researchHistoryExpanded} onOpenChange={setResearchHistoryExpanded} className="mb-2">
                <CollapsibleTrigger className="w-full">
                  <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 hover:bg-secondary/30 rounded transition-colors">
                    <Search className="h-3 w-3" />
                    <span className="flex-1 text-left">Research ({researchSessions.length})</span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${researchHistoryExpanded ? "rotate-180" : ""}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 space-y-0.5">
                  {researchSessions.slice(0, 6).map((session) => renderSessionItem(session, true))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Inline Asks - Collapsible */}
            {inlineAsks.length > 0 && (
              <Collapsible open={inlineAsksExpanded} onOpenChange={setInlineAsksExpanded} className="mb-2">
                <CollapsibleTrigger className="w-full">
                  <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 hover:bg-secondary/30 rounded transition-colors">
                    <Sparkles className="h-3 w-3" />
                    <span className="flex-1 text-left">Inline Asks ({inlineAsks.length})</span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${inlineAsksExpanded ? "rotate-180" : ""}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 space-y-0.5">
                  {inlineAsks.slice(0, 6).map((ask) => {
                    const colorConfig = getPinColorConfig(ask.pin_color);
                    return (
                      <div
                        key={ask.id}
                        className="group flex items-center w-full text-left px-2 py-2 text-xs rounded-md transition-colors text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      >
                        <button
                          onClick={() => onSelectInlineAsk?.(ask.id, ask.session_id)}
                          className="flex items-center gap-2.5 flex-1 min-w-0"
                        >
                          <Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                          <div className="flex-1 min-w-0 text-left">
                            <span className="truncate block text-[11px] leading-tight">
                              {ask.title || ask.highlighted_text.slice(0, 25)}{(!ask.title && ask.highlighted_text.length > 25) ? '...' : ''}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate block">
                              {ask.question.slice(0, 30)}{ask.question.length > 30 ? '...' : ''}
                            </span>
                          </div>
                        </button>
                        
                        {/* Status icons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                          {ask.is_pinned && (
                            <Pin className={`h-3 w-3 ${colorConfig.text} ${colorConfig.fill}`} />
                          )}
                          
                          {/* Actions Menu for Inline Ask */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-secondary rounded transition-opacity">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem onClick={() => onRenameInlineAsk?.(ask.id, ask.question)}>
                                <Pencil className="h-3 w-3 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onPinInlineAsk?.(ask.id)}>
                                <Pin className={`h-3 w-3 mr-2 ${ask.is_pinned ? colorConfig.fill + " " + colorConfig.text : ""}`} />
                                {ask.is_pinned ? "Unpin" : "Pin"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onShareInlineAsk?.(ask.id)}>
                                <Share2 className="h-3 w-3 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onArchiveInlineAsk?.(ask.id)}>
                                <Archive className="h-3 w-3 mr-2" />
                                {ask.is_archived ? "Unarchive" : "Archive"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onDeleteInlineAsk?.(ask.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                  {inlineAsks.length > 6 && (
                    <Link
                      to="/app/inline-asks"
                      className="block px-2 py-1.5 text-xs text-primary hover:underline"
                    >
                      View all {inlineAsks.length} inline asks →
                    </Link>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {chatSessions.length > 12 && (
              <Link
                to="/app/chat"
                className="block px-2 py-1.5 text-xs text-primary hover:underline"
              >
                View all {chatSessions.length} sessions →
              </Link>
            )}
            {chatSessions.length === 0 && inlineAsks.length === 0 && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">No history yet</div>
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
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
        } ${isNewSession ? "border border-primary/40 bg-primary/5" : ""}`}
      >
        <Icon
          className={`h-4 w-4 flex-shrink-0 ${isNewSession ? "text-primary" : active ? "text-primary" : ""}`}
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
            const featureKey = item.feature as "documents" | "images" | "video" | "sandbox" | "notebooks" | undefined;
            const showUsageBadge = featureKey && limits[featureKey] !== Infinity;
            const remaining = featureKey ? getRemainingUsage(featureKey) : 0;
            
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
                <span className="text-sm flex-1">{item.label}</span>
                {showUsageBadge && (
                  <Badge 
                    variant={remaining === 0 ? "destructive" : "secondary"} 
                    className="text-[9px] h-4 px-1.5"
                  >
                    {remaining}
                  </Badge>
                )}
              </Link>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // Responsive width classes
  const sidebarWidth = collapsed 
    ? "w-14" 
    : isMobile 
      ? "w-14" 
      : "w-48 md:w-52 lg:w-56";

  return (
    <>
    <aside
      className={`${sidebarWidth} border-r border-border bg-sidebar flex flex-col flex-shrink-0 transition-all duration-300 h-full`}
    >
      {/* Header with Logo and Collapse Toggle */}
      <div className="h-12 border-b border-sidebar-border flex items-center justify-between px-2 flex-shrink-0">
        <button 
          onClick={onNewSession}
          className="hover:opacity-80 transition-opacity flex-1"
          title="New Chat"
        >
          <Logo size="sm" showText={!collapsed && !isMobile} />
        </button>
        {!isMobile && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <ChevronsRight className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-1 min-h-0">
        {/* Primary Items */}
        <div className="space-y-1 px-2">
          {primaryItems.map(renderNavItem)}
        </div>

        {/* Divider */}
        <div className="h-px bg-sidebar-border mx-4 my-3" />

        {/* Create Section */}
        {renderCollapsibleSection("Create", Wand2, createItems, createOpen, setCreateOpen)}

        {/* Advanced Section */}
        {renderCollapsibleSection("Advanced", Beaker, advancedItems, advancedOpen, setAdvancedOpen)}

      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-2 flex-shrink-0 space-y-2">
        {user ? (
          <div className="space-y-2">
            {/* Plan Badge & Upgrade */}
            {!collapsed && !isMobile && (
              <button
                onClick={() => setUpgradeModalOpen(true)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md ${currentPlan.color} hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center gap-2">
                  {PlanIcon && <PlanIcon className="h-3.5 w-3.5" />}
                  <span className="text-xs font-medium">{currentPlan.label} Plan</span>
                </div>
                {plan === "free" && (
                  <span className="text-[10px] font-medium">Upgrade →</span>
                )}
              </button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors ${collapsed || isMobile ? "justify-center" : ""}`}>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  {!collapsed && !isMobile && (
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-sm font-medium text-sidebar-foreground truncate">
                        {user.email?.split("@")[0]}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </div>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/app/usage" className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Usage & Cost
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/settings" className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/personalization" className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Personalization
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/api-keys" className="flex items-center">
                    <Key className="h-4 w-4 mr-2" />
                    API Keys
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Link
            to="/auth"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 ${collapsed || isMobile ? "justify-center" : ""}`}
          >
            <User className="h-4 w-4 flex-shrink-0" />
            {!collapsed && !isMobile && <span className="text-sm">Sign In</span>}
          </Link>
        )}

      </div>
    </aside>

    <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
    </>
  );
};
