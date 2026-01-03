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
    const { text } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Enhancing prompt:", text.substring(0, 100) + "...");

    const systemPrompt = `You are a grammar and clarity enhancement assistant. Your task is to:

1. Fix any grammatical errors in the text
2. Improve clarity and readability
3. Enhance word choice with more precise or elegant vocabulary
4. Maintain the EXACT same meaning and intent
5. Keep the same tone (formal/informal)
6. Do NOT change the core message or add new information
7. Do NOT make the text longer unnecessarily
8. Preserve any technical terms or specific names exactly as written

IMPORTANT RULES:
- Only fix errors and improve clarity
- Do not rephrase completely - make minimal necessary changes
- If the text is already correct, return it as-is or with very minor improvements
- Preserve question marks, exclamation points, and the overall structure
- Keep the same language style (e.g., if casual, keep it casual)

Return ONLY the enhanced text, nothing else. No explanations or prefixes.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Enhance this text while preserving its meaning:\n\n${text}` }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const enhancedText = data.choices?.[0]?.message?.content?.trim() || text;

    console.log("Enhanced text:", enhancedText.substring(0, 100) + "...");

    return new Response(
      JSON.stringify({ 
        original: text,
        enhanced: enhancedText,
        changed: text !== enhancedText
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Enhance prompt function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
