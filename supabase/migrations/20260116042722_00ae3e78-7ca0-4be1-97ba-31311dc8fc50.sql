-- Create storage bucket for Memorix files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'memorix-files',
  'memorix-files',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'audio/mpeg', 'audio/wav', 'audio/mp4', 'video/mp4', 'video/webm', 'video/quicktime', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
);

-- Create table for Memorix sources
CREATE TABLE public.memorix_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'doc', 'audio', 'video', 'url')),
  file_path TEXT,
  file_url TEXT,
  file_size BIGINT,
  status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'ready', 'error')),
  extracted_text TEXT,
  embeddings JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Memorix outputs
CREATE TABLE public.memorix_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_ids UUID[] NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('slides', 'chart', 'video', 'memory-map', 'text')),
  title TEXT NOT NULL,
  content JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.memorix_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorix_outputs ENABLE ROW LEVEL SECURITY;

-- RLS policies for memorix_sources
CREATE POLICY "Users can view their own sources"
  ON public.memorix_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sources"
  ON public.memorix_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sources"
  ON public.memorix_sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sources"
  ON public.memorix_sources FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for memorix_outputs
CREATE POLICY "Users can view their own outputs"
  ON public.memorix_outputs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outputs"
  ON public.memorix_outputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outputs"
  ON public.memorix_outputs FOR DELETE
  USING (auth.uid() = user_id);

-- Storage policies for memorix-files bucket
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'memorix-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'memorix-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'memorix-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'memorix-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create updated_at trigger
CREATE TRIGGER update_memorix_sources_updated_at
  BEFORE UPDATE ON public.memorix_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();