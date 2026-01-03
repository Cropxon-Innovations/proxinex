const TAVILY_SEARCH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tavily-search`;

export interface Citation {
  id: number;
  title: string;
  url: string;
  published_date?: string;
  score: number;
  snippet?: string;
}

export interface ResearchResponse {
  answer: string;
  confidence: number;
  confidence_label: string;
  citations: Citation[];
  error?: string;
}

export interface SearchOptions {
  max_sources?: number;
  is_deep_research?: boolean;
}

export async function searchWithTavily(
  query: string, 
  options: SearchOptions = {}
): Promise<ResearchResponse> {
  const { max_sources = 15, is_deep_research = false } = options;
  
  try {
    const response = await fetch(TAVILY_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ query, max_sources, is_deep_research }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Tavily search error:", error);
    return {
      answer: "Failed to perform research. Please try again.",
      confidence: 0,
      confidence_label: "Error",
      citations: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
