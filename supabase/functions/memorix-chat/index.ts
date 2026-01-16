const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MemorixChatRequest {
  message: string;
  sourceIds: string[];
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sourceIds, conversationHistory = [] } = await req.json() as MemorixChatRequest;

    if (!message) {
      return new Response(
        JSON.stringify({ success: false, error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Memorix Chat: Processing message with ${sourceIds.length} sources`);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "AI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context from sources (in production, you'd fetch actual source data)
    const sourceContext = sourceIds.length > 0 
      ? `You have access to ${sourceIds.length} knowledge sources uploaded by the user. Use this context to answer their questions accurately with citations.`
      : "No sources have been uploaded yet. Let the user know they should upload documents for better answers.";

    const systemPrompt = `You are Memorix, an AI-powered Intelligence Memory Engine by Proxinex.

${sourceContext}

Your capabilities:
- Answer questions based on uploaded knowledge sources
- Provide citations when referencing specific documents
- Generate insights, summaries, and analysis
- Suggest relevant outputs like slides, charts, or memory maps

Be conversational, helpful, and precise. Always cite sources when available.
Format responses with markdown for readability.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("AI API error:", errorData);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(errorData.error?.message || "AI request failed");
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "I apologize, I couldn't generate a response.";

    console.log("Memorix Chat: Response generated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: assistantMessage,
        usage: data.usage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Memorix Chat error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to process chat",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
