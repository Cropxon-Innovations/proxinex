-- Add pin and archive columns to inline_asks table
ALTER TABLE public.inline_asks 
ADD COLUMN is_pinned boolean DEFAULT false,
ADD COLUMN is_archived boolean DEFAULT false,
ADD COLUMN pin_color text DEFAULT 'primary',
ADD COLUMN pin_order integer DEFAULT 0,
ADD COLUMN title text DEFAULT NULL;

-- Create index for faster filtering
CREATE INDEX idx_inline_asks_pinned ON public.inline_asks(is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_inline_asks_archived ON public.inline_asks(is_archived) WHERE is_archived = true;