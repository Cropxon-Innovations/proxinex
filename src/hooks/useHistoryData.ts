import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PinColor } from "@/components/chat/PinColorSelector";

export interface ChatSessionData {
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
  pinColor?: PinColor;
  pinOrder?: number;
}

export interface InlineAskItem {
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

export const useHistoryData = () => {
  const [chatSessions, setChatSessions] = useState<ChatSessionData[]>([]);
  const [inlineAsks, setInlineAsks] = useState<InlineAskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadChatSessions = useCallback(async () => {
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
        
        const hasResearchResponse = messagesArray.some((m: any) => m?.researchResponse);
        
        return {
          id: session.id,
          title: session.title,
          preview: previewText,
          timestamp: new Date(session.updated_at),
          messageCount: messagesArray.length,
          verified: true,
          citationCount: 0,
          isPinned: session.is_pinned || false,
          isArchived: session.is_archived || false,
          isResearch: hasResearchResponse,
          content: contentPreview,
          pinColor: (session.pin_color as PinColor) || "primary",
          pinOrder: session.pin_order || 0,
        };
      }));
    }
  }, [user]);

  const loadInlineAsks = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("inline_asks")
      .select("id, highlighted_text, question, created_at, session_id, is_pinned, is_archived, pin_color, title")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data && !error) {
      setInlineAsks(data.map(ask => ({
        ...ask,
        pin_color: (ask.pin_color as PinColor) || undefined
      })));
    }
  }, [user]);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([loadChatSessions(), loadInlineAsks()]);
    setIsLoading(false);
  }, [loadChatSessions, loadInlineAsks]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Session actions
  const handlePinSession = useCallback(async (sessionId: string, color?: PinColor) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session || !user) return;

    const newPinned = !session.isPinned;
    
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, isPinned: newPinned, pinColor: color || s.pinColor } : s
    ));
    
    await supabase
      .from("chat_sessions")
      .update({ 
        is_pinned: newPinned, 
        pin_color: color || session.pinColor || "primary" 
      })
      .eq("id", sessionId)
      .eq("user_id", user.id);
      
    toast({ title: newPinned ? "Session pinned" : "Session unpinned" });
  }, [chatSessions, user, toast]);

  const handleArchiveSession = useCallback(async (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session || !user) return;

    const newArchived = !session.isArchived;
    
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, isArchived: newArchived } : s
    ));
    
    await supabase
      .from("chat_sessions")
      .update({ is_archived: newArchived })
      .eq("id", sessionId)
      .eq("user_id", user.id);
      
    toast({ title: newArchived ? "Session archived" : "Session unarchived" });
  }, [chatSessions, user, toast]);

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    if (!user) return;
    
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    
    await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", user.id);
      
    toast({ title: "Session deleted" });
  }, [user, toast]);

  const handleRenameSession = useCallback(async (sessionId: string, newTitle: string) => {
    if (!user) return;
    
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, title: newTitle } : s
    ));
    
    await supabase
      .from("chat_sessions")
      .update({ title: newTitle })
      .eq("id", sessionId)
      .eq("user_id", user.id);
      
    toast({ title: "Session renamed" });
  }, [user, toast]);

  const handleReorderPinnedSessions = useCallback(async (reorderedSessions: ChatSessionData[]) => {
    if (!user) return;
    
    setChatSessions(reorderedSessions);
    
    // Update pin_order in database
    const pinnedSessions = reorderedSessions.filter(s => s.isPinned);
    for (let i = 0; i < pinnedSessions.length; i++) {
      await supabase
        .from("chat_sessions")
        .update({ pin_order: i })
        .eq("id", pinnedSessions[i].id)
        .eq("user_id", user.id);
    }
  }, [user]);

  // Inline Ask actions
  const handlePinInlineAsk = useCallback(async (askId: string, color?: PinColor) => {
    const ask = inlineAsks.find(a => a.id === askId);
    if (!ask || !user) return;

    const newPinned = !ask.is_pinned;
    
    setInlineAsks(prev => prev.map(a => 
      a.id === askId ? { ...a, is_pinned: newPinned, pin_color: color || a.pin_color } : a
    ));
    
    await supabase
      .from("inline_asks")
      .update({ 
        is_pinned: newPinned, 
        pin_color: color || ask.pin_color || "primary" 
      })
      .eq("id", askId)
      .eq("user_id", user.id);
      
    toast({ title: newPinned ? "Inline Ask pinned" : "Inline Ask unpinned" });
  }, [inlineAsks, user, toast]);

  const handleArchiveInlineAsk = useCallback(async (askId: string) => {
    const ask = inlineAsks.find(a => a.id === askId);
    if (!ask || !user) return;

    const newArchived = !ask.is_archived;
    
    setInlineAsks(prev => prev.map(a => 
      a.id === askId ? { ...a, is_archived: newArchived } : a
    ));
    
    await supabase
      .from("inline_asks")
      .update({ is_archived: newArchived })
      .eq("id", askId)
      .eq("user_id", user.id);
      
    toast({ title: newArchived ? "Inline Ask archived" : "Inline Ask unarchived" });
  }, [inlineAsks, user, toast]);

  const handleDeleteInlineAsk = useCallback(async (askId: string) => {
    if (!user) return;
    
    setInlineAsks(prev => prev.filter(a => a.id !== askId));
    
    await supabase
      .from("inline_asks")
      .delete()
      .eq("id", askId)
      .eq("user_id", user.id);
      
    toast({ title: "Inline Ask deleted" });
  }, [user, toast]);

  const handleRenameInlineAsk = useCallback(async (askId: string, newTitle: string) => {
    if (!user) return;
    
    setInlineAsks(prev => prev.map(a => 
      a.id === askId ? { ...a, title: newTitle } : a
    ));
    
    await supabase
      .from("inline_asks")
      .update({ title: newTitle })
      .eq("id", askId)
      .eq("user_id", user.id);
      
    toast({ title: "Inline Ask renamed" });
  }, [user, toast]);

  return {
    chatSessions,
    setChatSessions,
    inlineAsks,
    setInlineAsks,
    isLoading,
    loadChatSessions,
    loadInlineAsks,
    loadAll,
    // Session actions
    handlePinSession,
    handleArchiveSession,
    handleDeleteSession,
    handleRenameSession,
    handleReorderPinnedSessions,
    // Inline Ask actions
    handlePinInlineAsk,
    handleArchiveInlineAsk,
    handleDeleteInlineAsk,
    handleRenameInlineAsk,
  };
};
