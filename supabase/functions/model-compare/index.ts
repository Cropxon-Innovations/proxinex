import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  model: string;
}

const MODELS: Record<string, ModelConfig> = {
  "gemini-flash": {
    id: "gemini-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    model: "google/gemini-2.5-flash",
  },
  "gemini-pro": {
    id: "gemini-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    model: "google/gemini-2.5-pro",
  },
  "gpt5": {
    id: "gpt5",
    name: "GPT-5",
    provider: "OpenAI",
    model: "openai/gpt-5",
  },
  "gpt5-mini": {
    id: "gpt5-mini",
    name: "GPT-5 Mini",
    provider: "OpenAI",
    model: "openai/gpt-5-mini",
  },
};

async function queryModel(
  apiKey: string,
  modelConfig: ModelConfig,
  query: string
): Promise<{
  model: string;
  provider: string;
  response: string;
  latency: number;
  cost: number;
  success: boolean;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelConfig.model,
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant. Provide accurate, well-structured responses with markdown formatting when appropriate. Be concise but comprehensive.",
          },
          { role: "user", content: query },
        ],
        max_tokens: 1000,
      }),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Model ${modelConfig.name} error:`, response.status, errorText);
      return {
        model: modelConfig.name,
        provider: modelConfig.provider,
        response: "",
        latency,
        cost: 0,
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const usage = data.usage || {};
    
    // Calculate cost based on tokens (approximate)
    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const costDetails = usage.cost_details || {};
    const cost = costDetails.upstream_inference_cost || ((promptTokens * 0.00001) + (completionTokens * 0.00003));

    return {
      model: modelConfig.name,
      provider: modelConfig.provider,
      response: content,
      latency,
      cost: cost * 83, // Convert to INR approximately
      success: true,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    console.error(`Model ${modelConfig.name} exception:`, error);
    return {
      model: modelConfig.name,
      provider: modelConfig.provider,
      response: "",
      latency,
      cost: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, models: selectedModels } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    if (!query || !selectedModels || selectedModels.length === 0) {
      return new Response(
        JSON.stringify({ error: "Query and at least one model required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Comparing ${selectedModels.length} models for query: "${query.substring(0, 50)}..."`);

    // Query all selected models in parallel
    const modelConfigs = selectedModels
      .filter((id: string) => MODELS[id])
      .map((id: string) => MODELS[id]);

    const results = await Promise.all(
      modelConfigs.map((config: ModelConfig) => queryModel(LOVABLE_API_KEY, config, query))
    );

    // Calculate summary
    const successfulResults = results.filter(r => r.success);
    const summary = {
      highestAccuracy: successfulResults.length > 0 
        ? successfulResults.reduce((a, b) => a.response.length > b.response.length ? a : b).model 
        : null,
      fastestResponse: successfulResults.length > 0
        ? successfulResults.reduce((a, b) => a.latency < b.latency ? a : b)
        : null,
      lowestCost: successfulResults.length > 0
        ? successfulResults.reduce((a, b) => a.cost < b.cost ? a : b)
        : null,
    };

    console.log(`Comparison complete. ${successfulResults.length}/${results.length} models succeeded.`);

    return new Response(
      JSON.stringify({ results, summary }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Model compare function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
