-- Add pin_color and pin_order columns to chat_sessions for persisting pin state
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS pin_color text DEFAULT 'primary',
ADD COLUMN IF NOT EXISTS pin_order integer DEFAULT 0;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_chat_sessions_pin_order ON public.chat_sessions(pin_order) WHERE is_pinned = true;