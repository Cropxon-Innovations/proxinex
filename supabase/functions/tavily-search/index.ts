import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

interface Citation {
  id: number;
  title: string;
  url: string;
  content: string;
  published_date?: string;
  score: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, include_answer = false } = await req.json();
    const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!TAVILY_API_KEY) {
      console.error("TAVILY_API_KEY is not configured");
      throw new Error("Search service is not configured");
    }

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    console.log(`Searching for: "${query}"`);

    // Step 1: Search with Tavily
    const tavilyResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: "advanced",
        include_answer: false,
        include_raw_content: false,
        max_results: 8,
      }),
    });

    if (!tavilyResponse.ok) {
      const errorText = await tavilyResponse.text();
      console.error("Tavily API error:", tavilyResponse.status, errorText);
      throw new Error("Search failed");
    }

    const tavilyData = await tavilyResponse.json();
    const results: TavilyResult[] = tavilyData.results || [];

    console.log(`Found ${results.length} sources`);

    if (results.length === 0) {
      return new Response(
        JSON.stringify({
          answer: "I couldn't find reliable sources to answer this question. Please try rephrasing your query or asking about a different topic.",
          confidence: 15,
          confidence_label: "Low",
          citations: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Build citations from sources
    const citations: Citation[] = results.map((r, idx) => ({
      id: idx + 1,
      title: r.title,
      url: r.url,
      content: r.content,
      published_date: r.published_date,
      score: r.score,
    }));

    // Step 3: Build source context for LLM
    const sourceContext = citations
      .map((c) => `[${c.id}] ${c.title} – ${c.content}`)
      .join("\n\n");

    const systemPrompt = `You are Proxinex, generating a research answer with citations.

STRICT RULES:
- Use ONLY the provided sources below
- Every factual claim MUST include a citation marker (¹, ², ³, etc.)
- Do NOT invent facts or sources
- If sources are insufficient for a complete answer, clearly state that
- Write in natural, readable language
- Place citation markers immediately after the relevant fact
- Use superscript notation: ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸

SOURCES:
${sourceContext}

Respond with a well-structured answer using the sources above. Include inline citations.`;

    console.log("Generating answer with LLM...");

    // Step 4: Generate answer with Lovable AI
    const llmResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
      }),
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();
      console.error("LLM API error:", llmResponse.status, errorText);
      throw new Error("Failed to generate answer");
    }

    const llmData = await llmResponse.json();
    const answer = llmData.choices?.[0]?.message?.content || "Unable to generate answer";

    // Step 5: Calculate confidence based on source quality
    const avgScore = citations.reduce((sum, c) => sum + c.score, 0) / citations.length;
    const confidence = Math.min(95, Math.max(20, Math.round(avgScore * 100)));
    
    let confidence_label = "Low";
    if (confidence >= 80) confidence_label = "High";
    else if (confidence >= 60) confidence_label = "Good";
    else if (confidence >= 40) confidence_label = "Medium";

    console.log(`Generated answer with ${confidence}% confidence (${confidence_label})`);

    // Return structured response
    return new Response(
      JSON.stringify({
        answer,
        confidence,
        confidence_label,
        citations: citations.map((c) => ({
          id: c.id,
          title: c.title,
          url: c.url,
          published_date: c.published_date,
          score: Math.round(c.score * 100),
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Tavily search function error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        answer: null,
        confidence: 0,
        confidence_label: "Error",
        citations: [],
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
