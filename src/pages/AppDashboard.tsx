import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { PersistentInlineAsk, usePersistentInlineAsk } from "@/components/PersistentInlineAsk";
import { streamChat, Message, ChatMetrics } from "@/lib/chat";
import { searchWithTavily, ResearchResponse } from "@/lib/tavily";
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatHistory } from "@/components/chat/ChatHistory";
import { RelatedQueries } from "@/components/chat/RelatedQueries";
import { ProjectMemory } from "@/components/chat/ProjectMemory";
import { ThemeSelector } from "@/components/chat/ThemeSelector";
import { NotificationCenter } from "@/components/NotificationCenter";
import { KeyboardShortcutsButton } from "@/components/KeyboardShortcuts";
import { ChatExport } from "@/components/chat/ChatExport";
import { InlineAskExport } from "@/components/chat/InlineAskExport";
import { TokenCounter } from "@/components/chat/TokenCounter";
import { PinnedMessages } from "@/components/chat/PinnedMessages";
import { InlineAskData, InlineAskComment } from "@/components/chat/InlineAskComment";
import { CitationAnswer } from "@/components/CitationAnswer";
import { PinColor } from "@/components/chat/PinColorSelector";
import { RenameSessionDialog } from "@/components/chat/RenameSessionDialog";
import { PinColorPickerDialog } from "@/components/chat/PinColorPickerDialog";
import { ThinkingAnimation } from "@/components/chat/ThinkingAnimation";
import { LinkPreviewPanel } from "@/components/LinkPreviewPanel";
import { DeleteSessionDialog } from "@/components/chat/DeleteSessionDialog";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SwipeableSidebar, useSwipeToOpen } from "@/components/SwipeableSidebar";
import { CitationPreviewPanel } from "@/components/CitationPreviewPanel";
import { 
  MessageSquare,
  Sparkles,
  History,
  Menu,
} from "lucide-react";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { UploadedFile } from "@/components/chat/FileUploadPreview";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
// Collapsible imports now handled in AppSidebar

// Sidebar items moved to AppSidebar component

interface ChatSessionData {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
  verified: boolean;
  citationCount: number;
  projectId?: string;
  projectName?: string;
  isArchived?: boolean;
  isStarred?: boolean;
  isPinned?: boolean;
  isResearch?: boolean;
  content?: string;
  pinColor?: "primary" | "red" | "orange" | "yellow" | "green" | "blue" | "purple";
  pinOrder?: number;
}

interface MessageWithMetrics extends Message {
  metrics?: ChatMetrics;
}

const AppDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<"history" | "citations">("history");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<MessageWithMetrics[]>([]);
  const [lastMetrics, setLastMetrics] = useState<ChatMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentCost, setCurrentCost] = useState(0);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [autoMode, setAutoMode] = useState(true);
  const [researchMode, setResearchMode] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSessionData[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [relatedQueries, setRelatedQueries] = useState<string[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<MessageWithMetrics[]>([]);
  const [inlineAsks, setInlineAsks] = useState<InlineAskData[]>([]);
  const [maximizedInlineAsk, setMaximizedInlineAsk] = useState<InlineAskData | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<any>(null);
  // chatDropdownOpen state moved to AppSidebar
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [linkPreviewUrl, setLinkPreviewUrl] = useState<string | null>(null);
  const [linkPreviewTitle, setLinkPreviewTitle] = useState<string | undefined>(undefined);
  const [pinColorPickerOpen, setPinColorPickerOpen] = useState(false);
  const [pendingPinSessionId, setPendingPinSessionId] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameSessionId, setRenameSessionId] = useState<string | null>(null);
  const [renameSessionTitle, setRenameSessionTitle] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [deleteSessionTitle, setDeleteSessionTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { selection, handleMouseUp, clearSelection, isMaximized, toggleMaximize } = usePersistentInlineAsk();

  // Swipe gesture to open sidebar on mobile
  useSwipeToOpen(() => setMobileSidebarOpen(true));

  // Get citations from last research message
  const lastResearchMessage = messages.filter(m => m.role === "assistant" && m.researchResponse).pop();
  const currentCitations = lastResearchMessage?.researchResponse?.citations?.map((c: any, i: number) => ({
    id: String(i),
    title: c.title,
    url: c.url,
    snippet: c.snippet,
    domain: c.domain,
    favicon: c.favicon,
  })) || [];

  // Mock memories for project
  const projectMemories = [
    { id: "1", type: "fact" as const, content: "Quantum computing uses qubits that can exist in superposition", timestamp: new Date(), verified: true, sources: 3 },
    { id: "2", type: "decision" as const, content: "Focus on practical AI applications for 2025 roadmap", timestamp: new Date(), verified: true },
    { id: "3", type: "summary" as const, content: "India's AI funding grew 47% in 2024 driven by govt initiatives", timestamp: new Date(), verified: true, sources: 5 },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat sessions from database
  // Load chat from URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const chatId = searchParams.get("chat");

    if (!chatId || !user) return;
    if (chatId === activeSessionId) return;

    const loadChatFromUrl = async () => {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("id", chatId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) return;

      const messagesArray = Array.isArray(data.messages)
        ? (data.messages as unknown as MessageWithMetrics[])
        : [];

      setMessages(messagesArray);
      setActiveSessionId(data.id);

      const lastAssistantMsg = messagesArray.filter((m) => m.role === "assistant").pop();
      if (lastAssistantMsg?.metrics) {
        setLastMetrics(lastAssistantMsg.metrics);
      }

      await loadInlineAsks(data.id);
    };

    loadChatFromUrl();
  }, [location.search, user]);

  useEffect(() => {
    const loadSessions = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (data && !error) {
        setChatSessions(data.map(session => {
          const messagesArray = Array.isArray(session.messages) ? session.messages as any[] : [];
          const contentPreview = messagesArray
            .filter((m) => m?.role === "assistant")
            .map((m) => m?.content || "")
            .join("\n\n");
          
          const firstMessage = messagesArray[0];
          const previewText = typeof firstMessage?.content === 'string' 
            ? firstMessage.content.slice(0, 50) 
            : "Chat session";
          
          // Check if this was a research session by looking at messages with research responses
          const hasResearchResponse = messagesArray.some((m: any) => m?.researchResponse);
          
          return {
            id: session.id,
            title: session.title,
            preview: previewText,
            timestamp: new Date(session.updated_at),
            messageCount: messagesArray.length,
            verified: true,
            citationCount: 0,
            isPinned: (session as any).is_pinned || false,
            isArchived: (session as any).is_archived || false,
            isResearch: hasResearchResponse,
            content: contentPreview,
            pinColor: (session as any).pin_color || "primary",
            pinOrder: (session as any).pin_order || 0,
          };
        }));
      }
    };

    loadSessions();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    // Research mode - use Tavily
    if (researchMode) {
      // Add placeholder for loading state
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "", 
        timestamp: new Date() 
      }]);

      try {
        const response = await searchWithTavily(query);
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: response.answer,
            timestamp: new Date(),
            researchResponse: response,
          };
          return updated;
        });

        if (response.error) {
          toast({
            title: "Research Error",
            description: response.error,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to perform research",
          variant: "destructive",
        });
        setMessages(prev => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
        saveChatSession();
      }
      return;
    }

    // Regular chat mode
    let assistantContent = "";
    
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.role === "assistant") {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent, timestamp: new Date() }];
      });
    };

    await streamChat({
      messages: [...messages, userMessage],
      type: "chat",
      onDelta: updateAssistant,
      onDone: (metrics, dynamicRelatedQueries) => {
        setIsLoading(false);
        if (metrics) {
          setLastMetrics(metrics);
          setCurrentCost(prev => prev + metrics.cost);
          // Update the last assistant message with metrics
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.role === "assistant") {
              return prev.map((m, i) => 
                i === prev.length - 1 ? { ...m, metrics } : m
              );
            }
            return prev;
          });
        }
        // Set dynamic related queries from AI
        if (dynamicRelatedQueries && dynamicRelatedQueries.length > 0) {
          setRelatedQueries(dynamicRelatedQueries);
        }
        // Save session to history
        saveChatSession();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        setIsLoading(false);
      },
    });
  };

  const saveChatSession = async () => {
    if (!user || messages.length === 0) return;

    const title = messages[0]?.content.slice(0, 50) || "New Chat";
    
    const { data, error } = await supabase
      .from("chat_sessions")
      .upsert({
        id: activeSessionId || undefined,
        user_id: user.id,
        title,
        messages: messages as any,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (data && !error) {
      setActiveSessionId(data.id);
      // Update URL with new session ID so refresh/share works
      if (!activeSessionId) {
        navigate(`/app?chat=${data.id}`, { replace: true });
      }
    }
  };

  const handleOpenDeleteDialog = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    setDeleteSessionId(sessionId);
    setDeleteSessionTitle(session?.title || "this session");
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteSessionId) return;
    
    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", deleteSessionId);

    if (!error) {
      setChatSessions(prev => prev.filter(s => s.id !== deleteSessionId));
      toast({ title: "Session deleted" });
    }
    
    setDeleteSessionId(null);
    setDeleteDialogOpen(false);
  };

  // Load inline asks for a session
  const loadInlineAsks = async (sessionId: string) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("inline_asks")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", user.id);
    
    if (data && !error) {
      const loadedAsks: InlineAskData[] = data.map(ask => ({
        id: ask.id,
        selectedText: ask.highlighted_text,
        question: ask.question,
        answer: ask.answer || "",
        confidence: 85,
        timestamp: new Date(ask.created_at),
        messageIndex: 0,
        startOffset: ask.position_start || 0,
        endOffset: ask.position_end || 0,
        conversationHistory: Array.isArray(ask.conversation_history) 
          ? ask.conversation_history as any
          : []
      }));
      setInlineAsks(loadedAsks);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    if (!user) return;

    // Keep URL in sync so the "load from URL" effect doesn't overwrite the selection.
    navigate(`/app?chat=${sessionId}`);

    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (error || !data) return;

    const messagesArray = Array.isArray(data.messages)
      ? (data.messages as unknown as MessageWithMetrics[])
      : [];

    setMessages(messagesArray);
    setActiveSessionId(data.id);

    const lastAssistantMsg = messagesArray.filter((m) => m.role === "assistant").pop();
    if (lastAssistantMsg?.metrics) {
      setLastMetrics(lastAssistantMsg.metrics);
    }

    await loadInlineAsks(data.id);
  };

  const handleStarSession = (sessionId: string) => {
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, isStarred: !s.isStarred } : s
    ));
    toast({ title: "Session starred" });
  };

  const handleArchiveSession = async (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    const newArchived = !session?.isArchived;
    
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, isArchived: newArchived } : s
    ));
    
    // Persist to database
    if (user) {
      await supabase
        .from("chat_sessions")
        .update({ is_archived: newArchived })
        .eq("id", sessionId)
        .eq("user_id", user.id);
    }
    
    toast({ title: newArchived ? "Session archived" : "Session unarchived" });
  };

  const handlePinSession = async (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    
    // If already pinned, unpin it
    if (session?.isPinned) {
      setChatSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, isPinned: false } : s
      ));
      
      if (user) {
        await supabase
          .from("chat_sessions")
          .update({ is_pinned: false })
          .eq("id", sessionId)
          .eq("user_id", user.id);
      }
      
      toast({ title: "Session unpinned" });
    } else {
      // Show color picker for new pin
      setPendingPinSessionId(sessionId);
      setPinColorPickerOpen(true);
    }
  };

  const handlePinWithColor = async (color: PinColor) => {
    if (!pendingPinSessionId) return;
    
    const pinnedCount = chatSessions.filter(s => s.isPinned).length;
    
    setChatSessions(prev => prev.map(s => 
      s.id === pendingPinSessionId 
        ? { ...s, isPinned: true, pinColor: color, pinOrder: pinnedCount } 
        : s
    ));
    
    if (user) {
      await supabase
        .from("chat_sessions")
        .update({ 
          is_pinned: true, 
          pin_color: color,
          pin_order: pinnedCount 
        })
        .eq("id", pendingPinSessionId)
        .eq("user_id", user.id);
    }
    
    toast({ title: "Session pinned" });
    setPendingPinSessionId(null);
  };

  const handleOpenRenameDialog = (sessionId: string, currentTitle: string) => {
    setRenameSessionId(sessionId);
    setRenameSessionTitle(currentTitle);
    setRenameDialogOpen(true);
  };

  const handleRenameSession = async (newTitle: string) => {
    if (!renameSessionId) return;
    
    setChatSessions(prev => prev.map(s => 
      s.id === renameSessionId ? { ...s, title: newTitle } : s
    ));
    
    // Persist to database
    if (user) {
      await supabase
        .from("chat_sessions")
        .update({ title: newTitle })
        .eq("id", renameSessionId)
        .eq("user_id", user.id);
    }
    
    toast({ title: "Session renamed" });
    setRenameSessionId(null);
  };

  const handleExportSession = (sessionId: string) => {
    // This would trigger the export - for now just show toast
    toast({ title: "Export feature available in chat header" });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Handle link preview from citations
  const handleOpenLinkPreview = useCallback((url: string, title?: string) => {
    setLinkPreviewUrl(url);
    setLinkPreviewTitle(title);
  }, []);

  const handleCloseLinkPreview = useCallback(() => {
    setLinkPreviewUrl(null);
    setLinkPreviewTitle(undefined);
  }, []);

  // Handle reordering pinned sessions
  const handleReorderPinnedSessions = useCallback(async (reorderedSessions: ChatSessionData[]) => {
    setChatSessions(prev => {
      const unpinned = prev.filter(s => !s.isPinned);
      return [...reorderedSessions.map((s, i) => ({ ...s, pinOrder: i })), ...unpinned];
    });
    
    // Persist new order to database
    if (user) {
      const updates = reorderedSessions.map((session, index) => 
        supabase
          .from("chat_sessions")
          .update({ pin_order: index })
          .eq("id", session.id)
          .eq("user_id", user.id)
      );
      await Promise.all(updates);
    }
  }, [user]);

  // Handle new session - save current chat first
  const handleNewSession = async () => {
    if (messages.length > 0) {
      await saveChatSession();
      toast({ title: "Chat saved to history" });
    }
    // Reset state for new session
    setMessages([]);
    setActiveSessionId(null);
    setLastMetrics(null);
    setCurrentCost(0);
    setRelatedQueries([]);
    setQuery("");
    setPinnedMessages([]);
    setInlineAsks([]);
    setUploadedFiles([]);
    // Clear URL param
    navigate("/app", { replace: true });
  };

  // Pin/Unpin message handlers
  const handlePinMessage = (index: number) => {
    const message = messages[index];
    if (!message) return;

    const isPinned = pinnedMessages.some(m => m.originalIndex === index);
    
    if (isPinned) {
      setPinnedMessages(prev => prev.filter(m => m.originalIndex !== index));
      toast({ title: "Message unpinned" });
    } else {
      setPinnedMessages(prev => [...prev, { ...message, originalIndex: index }]);
      toast({ title: "Message pinned" });
    }
  };

  const handleScrollToMessage = (index: number) => {
    messageRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Inline Ask save handler - persist to database
  const handleSaveInlineAsk = async (data: InlineAskData) => {
    setInlineAsks(prev => [...prev, data]);
    
    // Persist to database
    if (user && activeSessionId) {
      try {
        const conversationData = data.conversationHistory 
          ? data.conversationHistory.map(c => ({
              role: c.role,
              content: c.content,
              timestamp: c.timestamp.toISOString()
            }))
          : [];
        
        await supabase.from("inline_asks").insert([{
          user_id: user.id,
          session_id: activeSessionId,
          highlighted_text: data.selectedText,
          question: data.question,
          answer: data.answer,
          position_start: data.startOffset,
          position_end: data.endOffset,
          conversation_history: conversationData
        }]);
      } catch (error) {
        console.error("Failed to persist inline ask:", error);
      }
    }
    
    toast({ title: "Inline Ask saved" });
  };

  // Delete inline ask
  const handleDeleteInlineAsk = async (id: string) => {
    // Remove from local state
    setInlineAsks(prev => prev.filter(ask => ask.id !== id));
    
    // Delete from database
    if (user) {
      try {
        await supabase
          .from("inline_asks")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
        toast({ title: "Inline Ask deleted" });
      } catch (error) {
        console.error("Failed to delete inline ask:", error);
        toast({ title: "Failed to delete", variant: "destructive" });
      }
    }
    
    // Close maximized view if it's the one being deleted
    if (maximizedInlineAsk?.id === id) {
      setMaximizedInlineAsk(null);
    }
  };

  // Edit inline ask
  const handleEditInlineAsk = async (id: string, updatedData: Partial<InlineAskData>) => {
    // Update local state
    setInlineAsks(prev => prev.map(ask => 
      ask.id === id ? { ...ask, ...updatedData } : ask
    ));
    
    // Update in database
    if (user) {
      try {
        await supabase
          .from("inline_asks")
          .update({
            question: updatedData.question,
            answer: updatedData.answer
          })
          .eq("id", id)
          .eq("user_id", user.id);
        toast({ title: "Inline Ask updated" });
      } catch (error) {
        console.error("Failed to update inline ask:", error);
        toast({ title: "Failed to update", variant: "destructive" });
      }
    }
    
    // Update maximized view if it's being edited
    if (maximizedInlineAsk?.id === id) {
      setMaximizedInlineAsk(prev => prev ? { ...prev, ...updatedData } : null);
    }
  };

  const handleVoiceStart = () => {
    setIsRecording(true);
    toast({ title: "Voice recording started", description: "Speak your query..." });
  };

  const handleVoiceStop = () => {
    setIsRecording(false);
    toast({ title: "Voice recording stopped" });
  };

  const handleFileUpload = (files: FileList) => {
    toast({ title: `${files.length} file(s) selected`, description: "Processing..." });
  };

  const handleRelatedQueryClick = (q: string) => {
    setQuery(q);
  };

  const lastAssistantMessage = messages.filter(m => m.role === "assistant").pop();

  return (
    <>
      <Helmet>
        <title>Proxinex App - AI Intelligence Control</title>
        <meta name="description" content="Access the Proxinex AI Intelligence Control Plane." />
      </Helmet>

      <div className="h-screen bg-background flex overflow-hidden pb-16 md:pb-0">
        {/* Mobile Sidebar - Swipeable */}
        <SwipeableSidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        >
          <AppSidebar
            collapsed={false}
            onToggleCollapse={() => setMobileSidebarOpen(false)}
            user={user}
            onSignOut={handleSignOut}
            chatSessions={chatSessions}
            activeSessionId={activeSessionId}
            onSelectSession={(id) => {
              handleSelectSession(id);
              setMobileSidebarOpen(false);
            }}
            onNewSession={() => {
              handleNewSession();
              setMobileSidebarOpen(false);
            }}
            onDeleteSession={handleOpenDeleteDialog}
            onRenameSession={handleOpenRenameDialog}
            onPinSession={handlePinSession}
            onArchiveSession={handleArchiveSession}
            onShareSession={(sessionId) => {
              const baseUrl = window.location.hostname === 'localhost' 
                ? window.location.origin 
                : 'https://proxinex.com';
              const shareUrl = `${baseUrl}/app?chat=${sessionId}`;
              navigator.clipboard.writeText(shareUrl);
              toast({ title: "Link copied", description: "Proxinex chat link copied to clipboard" });
            }}
            onReorderPinnedSessions={handleReorderPinnedSessions}
          />
        </SwipeableSidebar>

        {/* Left Sidebar - Fixed (Desktop) */}
        <div className="hidden md:block flex-shrink-0 h-full">
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            user={user}
            onSignOut={handleSignOut}
            chatSessions={chatSessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
            onDeleteSession={handleOpenDeleteDialog}
            onRenameSession={handleOpenRenameDialog}
            onPinSession={handlePinSession}
            onArchiveSession={handleArchiveSession}
            onShareSession={(sessionId) => {
              const baseUrl = window.location.hostname === 'localhost' 
                ? window.location.origin 
                : 'https://proxinex.com';
              const shareUrl = `${baseUrl}/app?chat=${sessionId}`;
              navigator.clipboard.writeText(shareUrl);
              toast({ title: "Link copied", description: "Proxinex chat link copied to clipboard" });
            }}
            onReorderPinnedSessions={handleReorderPinnedSessions}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Header - Fixed */}
          <header className="h-14 md:h-16 border-b border-border flex items-center justify-between px-3 md:px-6 flex-shrink-0 bg-background">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <Menu className="h-5 w-5 text-foreground" />
              </button>
              <h1 className="font-semibold text-foreground text-sm md:text-base">Chat</h1>
              {messages.length > 0 && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {messages.length} messages
                </span>
              )}
              {autoMode && (
                <span className="text-[10px] md:text-xs text-primary bg-primary/10 px-1.5 md:px-2 py-0.5 rounded-full">
                  Auto
                </span>
              )}
              {researchMode && (
                <span className="flex items-center gap-1 text-[10px] md:text-xs text-primary bg-primary/10 border border-primary/30 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full animate-pulse">
                  <Sparkles className="h-3 w-3" />
                  <span className="hidden sm:inline">Research Mode</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              {/* Token Counter - Hidden on mobile */}
              {query && <div className="hidden md:block"><TokenCounter text={query} model={selectedModel} /></div>}
              <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">
                ₹{currentCost.toFixed(3)}
              </span>
              <div className="hidden md:flex items-center gap-2">
                <InlineAskExport inlineAsks={inlineAsks} sessionTitle={messages[0]?.content.slice(0, 30) || "Proxinex Ask"} />
                <ChatExport messages={messages} sessionTitle={messages[0]?.content.slice(0, 30) || "Chat"} />
              </div>
              <KeyboardShortcutsButton />
              <NotificationCenter />
              <ThemeSelector />
            </div>
          </header>

          {/* Chat Area - Scrollable */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Messages Column - Scrollable */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto min-w-0"
              onMouseUp={(e) => handleMouseUp(e, messages.map(m => m.content).join("\n\n"))}
            >
              {/* Pinned Messages Section */}
              {pinnedMessages.length > 0 && (
                <PinnedMessages
                  messages={pinnedMessages}
                  onUnpin={handlePinMessage}
                  onScrollToMessage={handleScrollToMessage}
                />
              )}

              <div className="p-4 md:p-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="text-center max-w-md px-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                        What can I help you with?
                      </h2>
                      <p className="text-sm md:text-base text-muted-foreground mb-6">
                        Ask anything. Get accurate, cited answers. Highlight text to use Inline Ask™.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {[
                          "Explain quantum computing",
                          "Compare React vs Vue",
                          "Latest AI research trends"
                        ].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => setQuery(suggestion)}
                            className="px-3 py-1.5 text-xs md:text-sm bg-secondary text-muted-foreground hover:text-foreground rounded-full transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto">
                    {messages.map((message, index) => {
                      const messageMetrics = message.metrics || (message.role === "assistant" ? lastMetrics : null);
                      const isPinned = pinnedMessages.some(m => m.originalIndex === index);
                      const hasResearchResponse = message.researchResponse && message.role === "assistant";
                      const isLastMessage = index === messages.length - 1;
                      const isThinking = isLoading && isLastMessage && message.role === "assistant" && !message.content;
                      
                      return (
                        <div
                          key={index}
                          ref={(el) => { messageRefs.current[index] = el; }}
                        >
                          {message.role === "user" ? (
                            <ChatMessage
                              role={message.role}
                              content={message.content}
                              timestamp={message.timestamp}
                              isLoading={false}
                              isPinned={isPinned}
                              onPin={() => handlePinMessage(index)}
                            />
                          ) : isThinking ? (
                            <ThinkingAnimation 
                              isResearchMode={researchMode}
                              sources={message.researchResponse?.citations?.map(c => c.title.split(' ').slice(0, 3).join(' ')) || []}
                            />
                          ) : hasResearchResponse ? (
                            <div className="py-4">
                              <CitationAnswer
                                answer={message.researchResponse!.answer}
                                confidence={message.researchResponse!.confidence}
                                confidence_label={message.researchResponse!.confidence_label}
                                citations={message.researchResponse!.citations}
                                isLoading={isLoading && isLastMessage}
                                onOpenLinkPreview={handleOpenLinkPreview}
                              />
                            </div>
                          ) : (
                            <ChatMessage
                              role={message.role}
                              content={message.content}
                              timestamp={message.timestamp}
                              isLoading={isLoading && isLastMessage && !message.content}
                              accuracy={messageMetrics?.accuracy || 85}
                              cost={messageMetrics?.cost || 0.012}
                              model={messageMetrics?.model || (autoMode ? "Auto (Gemini 2.5 Flash)" : selectedModel)}
                              isPinned={isPinned}
                              onPin={() => handlePinMessage(index)}
                            />
                          )}
                        </div>
                      );
                    })}

                    {/* Related Queries */}
                    {!isLoading && messages.length > 0 && (
                      <RelatedQueries
                        queries={relatedQueries}
                        onQueryClick={handleRelatedQueryClick}
                      />
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Fixed, Link Preview, Citations, or Chat History */}
            {linkPreviewUrl ? (
              <div className="w-80 flex-shrink-0 hidden lg:block h-full overflow-hidden">
                <LinkPreviewPanel
                  url={linkPreviewUrl}
                  title={linkPreviewTitle}
                  onClose={handleCloseLinkPreview}
                />
              </div>
            ) : researchMode && currentCitations.length > 0 ? (
              <CitationPreviewPanel
                citations={currentCitations}
                selectedCitation={selectedCitation}
                onSelectCitation={setSelectedCitation}
                onClose={() => setRightPanelTab("history")}
                isCollapsed={rightPanelCollapsed}
                onToggleCollapse={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              />
            ) : messages.length > 0 && (
              <aside className="w-72 xl:w-80 border-l border-border bg-card/50 flex-shrink-0 hidden lg:flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-border flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Chat History</span>
                  </div>
                </div>

                {/* Panel Content - Scrollable */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  <ChatHistory
                    sessions={chatSessions}
                    activeSessionId={activeSessionId || undefined}
                    onSessionSelect={handleSelectSession}
                    onSessionDelete={handleOpenDeleteDialog}
                    onSessionStar={handleStarSession}
                    onSessionArchive={handleArchiveSession}
                    onSessionPin={handlePinSession}
                    onSessionRename={handleOpenRenameDialog}
                    onSessionExport={handleExportSession}
                  />
                </div>
              </aside>
            )}
          </div>

          {/* Input Area - Fixed */}
          <ChatInput
            query={query}
            setQuery={setQuery}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onFileUpload={handleFileUpload}
            onImageUpload={handleFileUpload}
            onVideoUpload={handleFileUpload}
            onVoiceStart={handleVoiceStart}
            onVoiceStop={handleVoiceStop}
            isRecording={isRecording}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            autoMode={autoMode}
            onAutoModeChange={setAutoMode}
            researchMode={researchMode}
            onResearchModeChange={setResearchMode}
            uploadedFiles={uploadedFiles}
            onFilesChange={setUploadedFiles}
          />
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav onNewChat={handleNewSession} />
      </div>

      {/* Persistent Inline Ask Popup */}
      {selection && (
        <PersistentInlineAsk
          selectedText={selection.text}
          position={selection.position}
          fullContext={messages.map(m => m.content).join("\n\n")}
          onClose={clearSelection}
          onSaveInlineAsk={handleSaveInlineAsk}
          hasActivePopup={false}
          messageIndex={selection.messageIndex}
          selectionOffset={selection.selectionOffset}
          isMaximized={isMaximized}
          onToggleMaximize={toggleMaximize}
        />
      )}

      {/* Maximized Inline Ask Comment */}
      {maximizedInlineAsk && (
        <InlineAskComment
          data={maximizedInlineAsk}
          onMaximize={() => {}}
          onClose={() => setMaximizedInlineAsk(null)}
          onDelete={handleDeleteInlineAsk}
          onEdit={handleEditInlineAsk}
          isMinimized={false}
        />
      )}

      {/* Pin Color Picker Dialog */}
      <PinColorPickerDialog
        open={pinColorPickerOpen}
        onOpenChange={setPinColorPickerOpen}
        onSelectColor={handlePinWithColor}
        currentColor="primary"
      />

      {/* Rename Session Dialog */}
      <RenameSessionDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        currentTitle={renameSessionTitle}
        onRename={handleRenameSession}
      />

      {/* Delete Session Confirmation Dialog */}
      <DeleteSessionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        sessionTitle={deleteSessionTitle}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default AppDashboard;
