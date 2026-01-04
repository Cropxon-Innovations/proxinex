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

// Generate dynamic related queries based on the user query and answer content
function generateRelatedQueries(userQuery: string, answer: string): string[] {
  const queries: string[] = [];
  const combinedText = `${userQuery} ${answer}`.toLowerCase();
  
  // Extract key topics and entities from the query
  const words = userQuery.split(/\s+/).filter(w => w.length > 3);
  const mainTopic = words.slice(0, 4).join(" ");
  
  // Topic-specific related queries
  const topicPatterns: Array<{ pattern: RegExp; queries: string[] }> = [
    { pattern: /finance|stock|market|invest|trading|crypto|bitcoin/i, queries: ["Market trends this week", "Investment strategies for beginners", "Financial news today"] },
    { pattern: /academic|research|study|paper|science|scientific/i, queries: ["Recent research findings", "Academic publications on this topic", "Peer-reviewed studies"] },
    { pattern: /social|twitter|reddit|opinion|trending|viral/i, queries: ["What people are saying", "Trending discussions", "Community perspectives"] },
    { pattern: /ai|artificial intelligence|machine learning|neural|llm|gpt/i, queries: ["Latest AI developments", "AI practical applications", "AI limitations and challenges"] },
    { pattern: /health|medical|disease|treatment|medicine/i, queries: ["Latest medical research", "Treatment options", "Health recommendations"] },
    { pattern: /tech|technology|software|programming|code/i, queries: ["Technology trends", "Best practices", "Implementation examples"] },
    { pattern: /business|startup|company|enterprise/i, queries: ["Business strategies", "Industry analysis", "Market opportunities"] },
    { pattern: /climate|environment|energy|sustainable/i, queries: ["Environmental impact", "Sustainability solutions", "Climate action"] },
  ];
  
  // Add topic-specific queries
  for (const { pattern, queries: topicQueries } of topicPatterns) {
    if (pattern.test(combinedText)) {
      queries.push(...topicQueries.slice(0, 2));
    }
  }
  
  // Generate query-specific follow-ups
  if (mainTopic) {
    queries.push(
      `${mainTopic} latest updates`,
      `${mainTopic} alternatives`,
      `How does ${mainTopic} compare to others?`
    );
  }
  
  // Add action-oriented queries based on query intent
  if (/what is|explain|define/i.test(userQuery)) {
    queries.push("Practical examples", "Common use cases");
  }
  if (/how to|guide|tutorial/i.test(userQuery)) {
    queries.push("Step-by-step instructions", "Best practices");
  }
  if (/compare|vs|versus|difference/i.test(userQuery)) {
    queries.push("Detailed comparison", "Pros and cons");
  }
  if (/why|reason|cause/i.test(userQuery)) {
    queries.push("Underlying factors", "Historical context");
  }
  
  // Remove duplicates and limit
  const uniqueQueries = [...new Set(queries)];
  return uniqueQueries.slice(0, 4);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, include_answer = false, max_sources = 15, is_deep_research = false, search_modes = [] } = await req.json();
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

    console.log(`Searching for: "${query}" with modes: ${JSON.stringify(search_modes)}`);

    // Build domain filters based on search modes
    const domainFilters: string[] = [];
    
    if (search_modes.includes("finance")) {
      domainFilters.push(
        "bloomberg.com", "reuters.com", "wsj.com", "ft.com", "cnbc.com",
        "marketwatch.com", "finance.yahoo.com", "investing.com", "seekingalpha.com"
      );
    }
    
    if (search_modes.includes("academic")) {
      domainFilters.push(
        "scholar.google.com", "arxiv.org", "pubmed.ncbi.nlm.nih.gov", "jstor.org",
        "sciencedirect.com", "researchgate.net", "nature.com", "science.org", "ieee.org"
      );
    }
    
    if (search_modes.includes("social")) {
      domainFilters.push(
        "twitter.com", "x.com", "reddit.com", "linkedin.com", "medium.com",
        "substack.com", "news.ycombinator.com", "quora.com"
      );
    }

    // Enhance query with mode context if modes are selected
    let enhancedQuery = query;
    if (search_modes.length > 0 && domainFilters.length > 0) {
      const modeLabels = search_modes.map((m: string) => m.charAt(0).toUpperCase() + m.slice(1));
      enhancedQuery = `${query} (${modeLabels.join(", ")} perspective)`;
    }

    // Step 1: Search with Tavily
    const tavilyBody: Record<string, unknown> = {
      api_key: TAVILY_API_KEY,
      query: enhancedQuery,
      search_depth: is_deep_research ? "advanced" : "advanced",
      include_answer: false,
      include_raw_content: false,
      max_results: Math.min(max_sources, 20),
    };
    
    // Add domain filter if modes are selected
    if (domainFilters.length > 0) {
      tavilyBody.include_domains = domainFilters;
    }

    const tavilyResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tavilyBody),
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
- Write in natural, readable language with clear structure
- Use **bold** for key terms and important concepts
- Use *italic* for emphasis on notable points
- Use bullet points or numbered lists when listing multiple items
- Place citation markers immediately after the relevant fact
- Use superscript notation: ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸
- Start with a brief summary paragraph
- Organize information with clear sections if the topic is complex

SOURCES:
${sourceContext}

Respond with a well-structured answer using the sources above. Include inline citations and use formatting for readability.`;

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

    // Step 6: Generate dynamic related queries based on answer content
    const relatedQueries = generateRelatedQueries(query, answer);

    // Return structured response with snippets and search modes
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
          snippet: c.content.slice(0, 200) + (c.content.length > 200 ? "..." : ""),
        })),
        searchModes: search_modes,
        relatedQueries,
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
