-- Add conversation_history column to inline_asks table for multi-turn conversations
ALTER TABLE public.inline_asks 
ADD COLUMN IF NOT EXISTS conversation_history jsonb DEFAULT '[]'::jsonb;

-- Enable realtime for inline_asks
ALTER PUBLICATION supabase_realtime ADD TABLE public.inline_asks;