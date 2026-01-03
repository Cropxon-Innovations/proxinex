import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, duration = 5, aspectRatio = "16:9" } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating video with prompt:", prompt, "duration:", duration, "aspect:", aspectRatio);

    // First generate a key frame image using Gemini
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: `Generate a cinematic ${aspectRatio} aspect ratio key frame image for this video concept: ${prompt}. 
            Style: Professional, high-quality, suitable for video production. Ultra high resolution.
            This will be used as the first frame of an AI-generated video.`
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!imageResponse.ok) {
      if (imageResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (imageResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await imageResponse.text();
      console.error("AI gateway error:", imageResponse.status, errorText);
      throw new Error(`AI gateway error: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const thumbnailUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!thumbnailUrl) {
      throw new Error("Failed to generate thumbnail");
    }

    // Generate a description for the video
    const descriptionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: `Describe what would happen in a ${duration} second video with this prompt: "${prompt}". 
            Write 2-3 sentences describing the visual flow and motion. Be cinematic and descriptive.`
          }
        ]
      }),
    });

    let description = "AI-generated video based on your prompt.";
    if (descriptionResponse.ok) {
      const descData = await descriptionResponse.json();
      description = descData.choices?.[0]?.message?.content || description;
    }

    // For demo purposes, we'll return the thumbnail as the video preview
    // In production, this would integrate with actual video generation models
    const videoId = Math.random().toString(36).substr(2, 9);
    
    return new Response(
      JSON.stringify({ 
        videoId,
        thumbnailUrl,
        description,
        duration: `${duration}s`,
        aspectRatio,
        model: "Proxinex Video AI",
        prompt,
        status: "ready",
        // Demo video URL - in production this would be the generated video
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating video:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
