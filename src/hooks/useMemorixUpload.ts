import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MemorixSource {
  id: string;
  name: string;
  type: "pdf" | "doc" | "audio" | "video" | "url";
  file_path?: string;
  file_url?: string;
  file_size?: number;
  status: "uploading" | "processing" | "ready" | "error";
  progress: number;
  extracted_text?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export const useMemorixUpload = () => {
  const [sources, setSources] = useState<MemorixSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSources = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("memorix_sources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSources(
        (data || []).map((s) => ({
          ...s,
          progress: s.status === "ready" ? 100 : s.status === "processing" ? 50 : 0,
        })) as MemorixSource[]
      );
    } catch (error) {
      console.error("Error fetching sources:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadFile = useCallback(
    async (file: File, type: "pdf" | "doc" | "audio" | "video") => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload files.",
          variant: "destructive",
        });
        return null;
      }

      const tempId = `temp-${Date.now()}`;
      const tempSource: MemorixSource = {
        id: tempId,
        name: file.name,
        type,
        file_size: file.size,
        status: "uploading",
        progress: 0,
        created_at: new Date().toISOString(),
      };

      setSources((prev) => [tempSource, ...prev]);

      try {
        // Upload file to storage
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from("memorix-files")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Update progress
        setSources((prev) =>
          prev.map((s) =>
            s.id === tempId ? { ...s, progress: 50, status: "processing" as const } : s
          )
        );

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("memorix-files")
          .getPublicUrl(filePath);

        // Create database record
        const { data: sourceData, error: dbError } = await supabase
          .from("memorix_sources")
          .insert({
            user_id: user.id,
            name: file.name,
            type,
            file_path: filePath,
            file_url: urlData.publicUrl,
            file_size: file.size,
            status: "processing",
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Call edge function to process the document
        const { data: processResult, error: processError } = await supabase.functions.invoke(
          "process-document",
          {
            body: {
              fileUrl: urlData.publicUrl,
              fileName: file.name,
              fileType: type,
              sourceId: sourceData.id,
            },
          }
        );

        if (processError) {
          console.error("Processing error:", processError);
          // Update status to ready even if processing fails
          await supabase
            .from("memorix_sources")
            .update({ status: "ready" })
            .eq("id", sourceData.id);
        } else if (processResult?.analysis) {
          // Update with extracted data
          await supabase
            .from("memorix_sources")
            .update({
              status: "ready",
              extracted_text: processResult.analysis.extractedText || processResult.analysis.summary,
              metadata: processResult.analysis,
            })
            .eq("id", sourceData.id);
        }

        // Replace temp source with real one
        setSources((prev) =>
          prev.map((s) =>
            s.id === tempId
              ? {
                  id: sourceData.id,
                  name: sourceData.name,
                  type: sourceData.type as "pdf" | "doc" | "audio" | "video" | "url",
                  file_path: sourceData.file_path || undefined,
                  file_url: sourceData.file_url || undefined,
                  file_size: sourceData.file_size || undefined,
                  status: "ready" as const,
                  progress: 100,
                  extracted_text: processResult?.analysis?.extractedText,
                  metadata: processResult?.analysis,
                  created_at: sourceData.created_at,
                }
              : s
          )
        );

        toast({
          title: "File uploaded",
          description: `${file.name} has been processed successfully.`,
        });

        return sourceData;
      } catch (error) {
        console.error("Upload error:", error);
        setSources((prev) =>
          prev.map((s) =>
            s.id === tempId ? { ...s, status: "error" as const, progress: 0 } : s
          )
        );
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload file",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  const addUrl = useCallback(
    async (url: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add URLs.",
          variant: "destructive",
        });
        return null;
      }

      try {
        const { data, error } = await supabase
          .from("memorix_sources")
          .insert({
            user_id: user.id,
            name: url,
            type: "url",
            file_url: url,
            status: "ready",
          })
          .select()
          .single();

        if (error) throw error;

        setSources((prev) => [
          { ...data, progress: 100 } as MemorixSource,
          ...prev,
        ]);

        toast({
          title: "URL added",
          description: "The URL has been added to your sources.",
        });

        return data;
      } catch (error) {
        console.error("Error adding URL:", error);
        toast({
          title: "Failed to add URL",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  const removeSource = useCallback(
    async (id: string) => {
      try {
        const source = sources.find((s) => s.id === id);
        
        // Delete from storage if file exists
        if (source?.file_path) {
          await supabase.storage.from("memorix-files").remove([source.file_path]);
        }

        // Delete from database
        const { error } = await supabase
          .from("memorix_sources")
          .delete()
          .eq("id", id);

        if (error) throw error;

        setSources((prev) => prev.filter((s) => s.id !== id));

        toast({
          title: "Source removed",
          description: "The source has been deleted.",
        });
      } catch (error) {
        console.error("Error removing source:", error);
        toast({
          title: "Failed to remove source",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
    },
    [sources, toast]
  );

  return {
    sources,
    isLoading,
    fetchSources,
    uploadFile,
    addUrl,
    removeSource,
    setSources,
  };
};
