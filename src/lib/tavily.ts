const TAVILY_SEARCH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tavily-search`;

export interface Citation {
  id: number;
  title: string;
  url: string;
  published_date?: string;
  score: number;
}

export interface ResearchResponse {
  answer: string;
  confidence: number;
  confidence_label: string;
  citations: Citation[];
  error?: string;
}

export async function searchWithTavily(query: string): Promise<ResearchResponse> {
  try {
    const response = await fetch(TAVILY_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ query }),
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
