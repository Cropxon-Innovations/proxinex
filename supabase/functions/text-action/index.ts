import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ActionType = "ask" | "explain" | "verify" | "sources" | "rewrite";

interface TextActionRequest {
  selected_text: string;
  full_answer_context?: string;
  action: ActionType;
  user_query?: string;
  rewrite_style?: "shorter" | "formal" | "technical" | "friendly";
}

async function performTavilySearch(query: string, apiKey: string) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "basic",
      include_answer: false,
      max_results: 5,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily search failed: ${response.status}`);
  }

  return response.json();
}

async function callLLM(systemPrompt: string, userMessage: string, apiKey: string) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM call failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: TextActionRequest = await req.json();
    const { selected_text, full_answer_context, action, user_query, rewrite_style } = body;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("AI service is not configured");
    }

    console.log(`Processing ${action} action for text: "${selected_text.substring(0, 50)}..."`);

    let result: {
      answer: string;
      confidence: number;
      citations?: Array<{ id: number; title: string; url: string; published_date?: string }>;
      verified?: boolean;
      verification_status?: "verified" | "partially_supported" | "not_supported" | "insufficient_evidence";
      uses_sources?: boolean;
    };

    switch (action) {
      case "ask": {
        const systemPrompt = `You are Proxinex, answering a follow-up question about specific highlighted text. 
Be concise and directly address the question in context of the highlighted text.
If the question requires factual claims, indicate your confidence level.`;
        
        const userMessage = `Context (full answer): ${full_answer_context || "Not provided"}

Highlighted text: "${selected_text}"

User's question: ${user_query}

Provide a focused answer about this specific text.`;

        const answer = await callLLM(systemPrompt, userMessage, LOVABLE_API_KEY);
        result = { answer, confidence: 85, uses_sources: false };
        break;
      }

      case "explain": {
        const systemPrompt = `You are Proxinex, explaining complex text in simple terms.
Be clear, use analogies if helpful, and break down jargon.
Do not add new facts - only clarify what's already stated.`;
        
        const userMessage = `Explain this text in simple, easy-to-understand terms:

"${selected_text}"

Provide a brief, clear explanation that anyone can understand.`;

        const answer = await callLLM(systemPrompt, userMessage, LOVABLE_API_KEY);
        result = { answer, confidence: 95, uses_sources: false };
        break;
      }

      case "verify": {
        if (!TAVILY_API_KEY) {
          result = {
            answer: "Verification service is not configured. Unable to verify this claim.",
            confidence: 0,
            verified: false,
            verification_status: "insufficient_evidence",
            uses_sources: false,
          };
          break;
        }

        // Search for verification
        const searchResults = await performTavilySearch(
          `fact check: ${selected_text}`,
          TAVILY_API_KEY
        );

        const citations = searchResults.results?.slice(0, 5).map((r: any, i: number) => ({
          id: i + 1,
          title: r.title,
          url: r.url,
          published_date: r.published_date,
        })) || [];

        // Ask LLM to verify based on sources
        const systemPrompt = `You are Proxinex, a fact-checking AI. Analyze the claim against the provided sources.
Determine if the claim is:
- VERIFIED: Sources strongly support the claim
- PARTIALLY_SUPPORTED: Some evidence, but not conclusive
- NOT_SUPPORTED: Sources contradict the claim
- INSUFFICIENT_EVIDENCE: Not enough reliable sources found

Be objective and cite specific sources. Start your response with the verdict in brackets like [VERIFIED] or [NOT_SUPPORTED].`;

        const sourcesContext = citations.map((c: any) => `[${c.id}] ${c.title}: ${searchResults.results?.[c.id - 1]?.content || ""}`).join("\n\n");
        
        const userMessage = `Claim to verify: "${selected_text}"

Sources found:
${sourcesContext || "No sources found."}

Analyze and provide a verdict with explanation.`;

        const answer = await callLLM(systemPrompt, userMessage, LOVABLE_API_KEY);
        
        // Parse verification status from answer
        let verification_status: "verified" | "partially_supported" | "not_supported" | "insufficient_evidence" = "insufficient_evidence";
        let confidence = 40;
        
        if (answer.includes("[VERIFIED]")) {
          verification_status = "verified";
          confidence = 90;
        } else if (answer.includes("[PARTIALLY_SUPPORTED]")) {
          verification_status = "partially_supported";
          confidence = 65;
        } else if (answer.includes("[NOT_SUPPORTED]")) {
          verification_status = "not_supported";
          confidence = 75;
        }

        result = {
          answer: answer.replace(/\[(VERIFIED|PARTIALLY_SUPPORTED|NOT_SUPPORTED|INSUFFICIENT_EVIDENCE)\]/g, "").trim(),
          confidence,
          citations,
          verified: verification_status === "verified",
          verification_status,
          uses_sources: true,
        };
        break;
      }

      case "sources": {
        // For sources action, we just need to search and return citations
        if (!TAVILY_API_KEY) {
          result = {
            answer: "Source search is not configured.",
            confidence: 0,
            citations: [],
            uses_sources: true,
          };
          break;
        }

        const searchResults = await performTavilySearch(selected_text, TAVILY_API_KEY);
        
        const citations = searchResults.results?.slice(0, 5).map((r: any, i: number) => ({
          id: i + 1,
          title: r.title,
          url: r.url,
          published_date: r.published_date,
        })) || [];

        result = {
          answer: `Found ${citations.length} sources related to this text.`,
          confidence: citations.length > 3 ? 85 : citations.length > 0 ? 60 : 20,
          citations,
          uses_sources: true,
        };
        break;
      }

      case "rewrite": {
        const styleInstructions: Record<string, string> = {
          shorter: "Make it more concise while keeping the key meaning.",
          formal: "Rewrite in a professional, formal tone.",
          technical: "Make it more technical and precise.",
          friendly: "Rewrite in a casual, conversational tone.",
        };

        const systemPrompt = `You are Proxinex, rewriting text while preserving its meaning.
Do NOT add new facts or information.
${styleInstructions[rewrite_style || "shorter"]}`;
        
        const userMessage = `Rewrite this text (${rewrite_style || "shorter"}):

"${selected_text}"

Provide only the rewritten text, nothing else.`;

        const answer = await callLLM(systemPrompt, userMessage, LOVABLE_API_KEY);
        result = { answer, confidence: 95, uses_sources: false };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Action ${action} completed with confidence ${result.confidence}`);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Text action function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
