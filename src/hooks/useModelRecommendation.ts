import { useMemo } from "react";

export type QueryType = "code" | "writing" | "research" | "reasoning" | "image" | "video" | "vision" | "general";

export interface ModelRecommendation {
  id: string;
  name: string;
  reason: string;
  confidence: number;
}

// Query patterns for classification
const queryPatterns: Record<QueryType, RegExp[]> = {
  code: [
    /\b(code|function|class|variable|debug|error|bug|api|javascript|typescript|python|java|sql|css|html|react|node|programming|algorithm|compile|runtime|syntax)\b/i,
    /\b(implement|refactor|fix|write a function|create a class|parse|regex|loop|array|object|string)\b/i,
    /```|<code>|function\s*\(|const\s+|let\s+|var\s+|import\s+|export\s+/i,
  ],
  writing: [
    /\b(write|blog|article|essay|story|content|copy|email|letter|post|headline|caption|script|creative)\b/i,
    /\b(rewrite|edit|proofread|summarize|paraphrase|tone|style|draft)\b/i,
    /\b(marketing|sales|professional|formal|casual|persuasive)\b/i,
  ],
  research: [
    /\b(research|study|paper|journal|citation|source|fact|evidence|analyze|compare|statistics|data)\b/i,
    /\b(explain|how does|what is|why|when|who|where|history|science|theory)\b/i,
    /\b(find|search|lookup|information|knowledge|learn|understand)\b/i,
  ],
  reasoning: [
    /\b(solve|problem|logic|math|calculate|equation|proof|theorem|derive|deduce)\b/i,
    /\b(analyze|evaluate|compare|contrast|pros and cons|decision|strategy)\b/i,
    /\b(why|because|therefore|hence|thus|conclude|reason|argument)\b/i,
  ],
  image: [
    /\b(image|picture|photo|illustration|drawing|art|visual|design|graphic|logo|icon)\b/i,
    /\b(generate|create|make|draw|paint|render|visualize)\s+(an?\s+)?image/i,
    /\b(stable diffusion|dall-e|midjourney|sdxl)\b/i,
  ],
  video: [
    /\b(video|clip|animation|motion|film|movie|trailer|footage)\b/i,
    /\b(animate|create\s+video|generate\s+video|video\s+from)\b/i,
  ],
  vision: [
    /\b(analyze\s+(this\s+)?image|what's in|describe\s+(this\s+)?image|screenshot|diagram|chart|graph)\b/i,
    /\b(ocr|extract\s+text|read\s+(this\s+)?image|identify)\b/i,
  ],
  general: [],
};

// Model recommendations by query type
const modelRecommendations: Record<QueryType, ModelRecommendation[]> = {
  code: [
    { id: "code-llama", name: "Code LLaMA", reason: "Specialized for code generation & debugging", confidence: 95 },
    { id: "deepseek-coder", name: "DeepSeek Coder", reason: "Excellent for algorithms & problem-solving", confidence: 92 },
    { id: "o4-mini", name: "O4 Mini", reason: "Fast reasoning for coding tasks", confidence: 88 },
    { id: "gpt4o", name: "GPT-4o", reason: "Best function-calling & structured output", confidence: 85 },
  ],
  writing: [
    { id: "llama3-writing", name: "LLaMA 3 70B Writer", reason: "Best open-source writing quality", confidence: 94 },
    { id: "mixtral-8x7b", name: "Mixtral 8x7B", reason: "Excellent for long-form content", confidence: 90 },
    { id: "claude-sonnet", name: "Claude Sonnet", reason: "Deep reasoning with safety", confidence: 88 },
    { id: "gpt4o", name: "GPT-4o", reason: "Reliable for structured content", confidence: 85 },
  ],
  research: [
    { id: "llama3-rag", name: "LLaMA 3 + RAG", reason: "Research answers with citations", confidence: 96 },
    { id: "gemini-pro", name: "Gemini 2.5 Pro", reason: "1M+ context for deep research", confidence: 93 },
    { id: "claude-opus", name: "Claude Opus", reason: "Best for complex analysis", confidence: 90 },
    { id: "doc-llama", name: "Document LLaMA", reason: "PDF & document intelligence", confidence: 88 },
  ],
  reasoning: [
    { id: "mixtral-8x7b", name: "Mixtral 8x7B", reason: "Near-GPT-4 quality, affordable", confidence: 94 },
    { id: "llama3-70b", name: "LLaMA 3 70B", reason: "Deep reasoning & long context", confidence: 92 },
    { id: "claude-opus", name: "Claude Opus", reason: "Strongest logic chains", confidence: 95 },
    { id: "o3", name: "O3", reason: "Very powerful multi-step reasoning", confidence: 93 },
  ],
  image: [
    { id: "sdxl", name: "Stable Diffusion XL", reason: "High-quality open-source generation", confidence: 95 },
    { id: "controlnet", name: "SD ControlNet", reason: "Structured image control", confidence: 90 },
    { id: "dalle", name: "DALL·E 3", reason: "Premium creative images", confidence: 92 },
    { id: "gemini-3-pro", name: "Gemini 3 Pro Image", reason: "Latest generation quality", confidence: 88 },
  ],
  video: [
    { id: "stable-video", name: "Stable Video Diffusion", reason: "Image-to-video generation", confidence: 88 },
    { id: "animatediff", name: "AnimateDiff", reason: "Animated visual sequences", confidence: 85 },
  ],
  vision: [
    { id: "llava", name: "LLaVA", reason: "Best open-source vision analysis", confidence: 94 },
    { id: "gemini-vision", name: "Gemini Vision", reason: "Image & video analysis", confidence: 92 },
    { id: "phi-3-vision", name: "Phi-3 Vision", reason: "Compact & efficient", confidence: 85 },
  ],
  general: [
    { id: "llama3-8b", name: "LLaMA 3 8B", reason: "Fast general-purpose workhorse", confidence: 90 },
    { id: "gpt4o", name: "GPT-4o", reason: "Powerful all-rounder", confidence: 92 },
    { id: "mixtral-8x7b", name: "Mixtral 8x7B", reason: "Smart but affordable", confidence: 88 },
    { id: "mistral-7b", name: "Mistral 7B", reason: "Fast intent detection", confidence: 85 },
  ],
};

export const useModelRecommendation = (query: string) => {
  const classification = useMemo(() => {
    if (!query.trim()) {
      return { type: "general" as QueryType, confidence: 0, recommendations: [] };
    }

    let bestMatch: { type: QueryType; score: number } = { type: "general", score: 0 };

    // Check each query type
    for (const [type, patterns] of Object.entries(queryPatterns)) {
      if (type === "general") continue;
      
      let score = 0;
      for (const pattern of patterns) {
        const matches = query.match(pattern);
        if (matches) {
          score += matches.length * 10;
        }
      }

      if (score > bestMatch.score) {
        bestMatch = { type: type as QueryType, score };
      }
    }

    const confidence = Math.min(95, 50 + bestMatch.score);
    const recommendations = modelRecommendations[bestMatch.type] || modelRecommendations.general;

    return {
      type: bestMatch.type,
      confidence,
      recommendations,
    };
  }, [query]);

  return classification;
};

export const getQueryTypeLabel = (type: QueryType): string => {
  const labels: Record<QueryType, string> = {
    code: "Code & Development",
    writing: "Writing & Content",
    research: "Research & Analysis",
    reasoning: "Reasoning & Logic",
    image: "Image Generation",
    video: "Video Creation",
    vision: "Vision & Analysis",
    general: "General Query",
  };
  return labels[type];
};

export const getQueryTypeIcon = (type: QueryType): string => {
  const icons: Record<QueryType, string> = {
    code: "Code",
    writing: "Pen",
    research: "Search",
    reasoning: "Brain",
    image: "Image",
    video: "Video",
    vision: "Eye",
    general: "MessageSquare",
  };
  return icons[type];
};
