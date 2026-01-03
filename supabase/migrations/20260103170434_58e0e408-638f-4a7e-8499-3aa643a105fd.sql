-- Add new columns to chat_sessions for enhanced functionality
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;

-- Create index for faster queries on pinned/archived status
CREATE INDEX IF NOT EXISTS idx_chat_sessions_pinned ON public.chat_sessions(user_id, is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_chat_sessions_archived ON public.chat_sessions(user_id, is_archived) WHERE is_archived = true;