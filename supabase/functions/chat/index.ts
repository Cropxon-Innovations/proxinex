import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Pricing per 1K tokens (in INR, approximate)
const MODEL_PRICING = {
  "google/gemini-2.5-flash": { input: 0.0035, output: 0.014 },
  "google/gemini-2.5-pro": { input: 0.0175, output: 0.07 },
  "openai/gpt-5": { input: 0.35, output: 1.05 },
  "openai/gpt-5-mini": { input: 0.0105, output: 0.042 },
};

// Estimate tokens (rough approximation: 4 chars = 1 token)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Calculate accuracy based on response quality indicators
function calculateAccuracy(response: string, type: string): number {
  let score = 70; // Base score
  
  // Has citations/sources
  if (/\[\d+\]/.test(response)) score += 8;
  
  // Has structured content (headers, lists)
  if (/^#+\s/m.test(response) || /^[-*]\s/m.test(response) || /^\d+\.\s/m.test(response)) score += 5;
  
  // Has tables
  if (/\|.*\|/.test(response)) score += 5;
  
  // Has code blocks
  if (/```/.test(response)) score += 3;
  
  // Response length (detailed responses score higher)
  if (response.length > 500) score += 4;
  if (response.length > 1000) score += 3;
  
  // Has specific data/numbers
  if (/\d+%|\$\d+|₹\d+|\d+\.\d+/.test(response)) score += 3;
  
  // Research type gets higher base accuracy
  if (type === "research") score += 5;
  
  // Cap at 99
  return Math.min(score, 99);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type = "chat" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    const model = "google/gemini-2.5-flash";
    const pricing = MODEL_PRICING[model];
    
    // Calculate input tokens
    const inputText = messages.map((m: any) => m.content).join(" ");
    const inputTokens = estimateTokens(inputText);

    let systemPrompt = "";
    
    switch (type) {
      case "research":
        systemPrompt = `You are Proxinex, an advanced AI research assistant. Your role is to:
- Provide comprehensive, well-researched answers with citations
- Cross-reference multiple sources for accuracy
- Include relevant statistics and data when available
- Structure responses with clear headings (## for sections), bullet points, and **bold** for emphasis
- Always present comparisons in markdown tables with | column | format
- Include code examples with syntax highlighting using \`\`\`language blocks
- Indicate confidence levels and data freshness
- Suggest related topics for deeper exploration

IMPORTANT FORMATTING RULES:
1. Use ## for section headers with relevant icons (e.g., "## 📊 Key Statistics")
2. Present comparisons and data in markdown tables
3. Use bullet points for lists
4. Highlight important terms with **bold**
5. Include code snippets with proper syntax highlighting
6. End with a "## 📚 Sources" section with numbered references [1], [2], etc.
7. Keep responses concise but comprehensive`;
        break;
      case "inline_ask":
        systemPrompt = `You are Proxinex, responding to a follow-up question about highlighted text. 
Be concise and directly address the specific question about the highlighted content.
Use markdown formatting for clarity. Present any comparisons in tables.`;
        break;
      default:
        systemPrompt = `You are Proxinex, an intelligent AI assistant. You provide accurate, helpful, and concise responses.

FORMATTING RULES:
1. Use ## headers with icons for sections (e.g., "## 💡 Overview", "## 📊 Comparison")
2. Present comparisons, features, or data in markdown tables with | column | format
3. Use bullet points (- or *) for lists
4. Highlight key terms with **bold**
5. Show code with \`\`\`language syntax highlighting with comments
6. Use > blockquotes for important notes
7. Include [1], [2] citations for facts when applicable
8. Keep paragraphs brief and scannable

Always aim for clear, structured, visually organized responses.`;
    }

    console.log(`Processing ${type} request with ${messages.length} messages`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
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

    console.log("Streaming response started");
    
    // Create a TransformStream to inject metadata at the end
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";
    
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          await writer.write(new TextEncoder().encode(chunk));
          
          // Extract content from SSE
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) fullResponse += content;
              } catch {}
            }
          }
        }
        
        // Calculate metrics based on full response
        const outputTokens = estimateTokens(fullResponse);
        const cost = ((inputTokens * pricing.input) + (outputTokens * pricing.output)) / 1000;
        const accuracy = calculateAccuracy(fullResponse, type);
        
        // Send metadata event
        const metadataEvent = `data: ${JSON.stringify({
          type: "metadata",
          metrics: {
            cost: Math.round(cost * 1000) / 1000,
            accuracy,
            inputTokens,
            outputTokens,
            model,
          }
        })}\n\n`;
        
        await writer.write(new TextEncoder().encode(metadataEvent));
        await writer.write(new TextEncoder().encode("data: [DONE]\n\n"));
        await writer.close();
      } catch (error) {
        console.error("Stream processing error:", error);
        await writer.abort(error);
      }
    })();
    
    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
