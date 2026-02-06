# Proxinex Backend Migration Guide
## From Edge Functions to Production-Grade Backend

**By OriginX Labs PVT. LTD**  
**Document Version:** 1.0  
**Date:** February 2026

---

## Table of Contents
1. [Current Architecture Overview](#current-architecture)
2. [Why Migrate?](#why-migrate)
3. [Recommended Backend Options](#backend-options)
4. [What to Keep vs Migrate](#what-to-keep)
5. [Migration Strategy](#migration-strategy)
6. [.NET Core Backend Architecture](#dotnet-architecture)
7. [Model Routing Engine Design](#model-routing)
8. [Open & Closed Source Model Integration](#model-integration)
9. [API Contract (Keep UI Compatible)](#api-contract)
10. [Step-by-Step Migration Plan](#step-by-step)

---

## 1. Current Architecture Overview <a id="current-architecture"></a>

```
┌─────────────────────────────────────────┐
│         React Frontend (Vite)           │
│  - Chat UI, Memorix, Research, Docs     │
│  - Hosted on Vercel                     │
└──────────────┬──────────────────────────┘
               │ HTTPS (REST/SSE)
               ▼
┌─────────────────────────────────────────┐
│      Supabase Edge Functions (Deno)     │
│  - chat/                                │
│  - model-compare/                       │
│  - tavily-search/                       │
│  - process-document/                    │
│  - memorix-chat/                        │
│  - generate-image/                      │
│  - generate-video/                      │
│  - enhance-prompt/                      │
│  - text-action/                         │
│  - Razorpay payment functions           │
│  - send-email/                          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Supabase (PostgreSQL + Auth)       │
│  - User profiles, chat sessions        │
│  - Subscriptions, invoices             │
│  - Memorix sources/outputs             │
│  - File storage                        │
└─────────────────────────────────────────┘
```

### Current Edge Functions (15 total):
| Function | Purpose | Complexity |
|----------|---------|------------|
| `chat` | Main AI chat with streaming | High |
| `model-compare` | Compare multiple models | Medium |
| `tavily-search` | Web search via Tavily | Low |
| `process-document` | OCR + document analysis | Medium |
| `memorix-chat` | Knowledge-base chat | Medium |
| `generate-image` | AI image generation | Low |
| `generate-video` | AI video generation | Low |
| `enhance-prompt` | Prompt improvement | Low |
| `text-action` | Text operations | Low |
| `create-razorpay-order` | Payment creation | Medium |
| `verify-razorpay-payment` | Payment verification | Medium |
| `razorpay-webhook` | Payment webhooks | Medium |
| `cancel-subscription` | Subscription mgmt | Low |
| `downgrade-subscription` | Plan downgrade | Low |
| `send-email` | Email notifications | Low |

---

## 2. Why Migrate? <a id="why-migrate"></a>

### Current Limitations:
- **Cold starts**: Edge functions have ~200-500ms cold start latency
- **No persistent connections**: Can't maintain WebSocket pools to AI providers
- **Limited compute**: 50s max execution time, limited memory
- **No background jobs**: Can't run async processing pipelines
- **Single model gateway**: Currently only routes through Lovable AI gateway
- **No caching layer**: Every request hits the AI provider
- **No rate limiting control**: Dependent on gateway limits
- **No model fallback**: If one provider is down, no automatic failover
- **No fine-tuned model support**: Can't host custom/fine-tuned models
- **No vector database**: Memorix can't do real semantic search

### What You Gain with Custom Backend:
- ✅ **Multi-provider routing** (OpenAI, Anthropic, Google, Mistral, Llama, etc.)
- ✅ **Open-source model hosting** (vLLM, Ollama, TGI)
- ✅ **Semantic search** with vector databases (Qdrant, Pinecone, pgvector)
- ✅ **Response caching** and intelligent deduplication
- ✅ **Custom rate limiting** and usage metering
- ✅ **Background processing** for document ingestion pipelines
- ✅ **WebSocket support** for real-time streaming
- ✅ **Model fallback chains** and health monitoring
- ✅ **Cost optimization** with model selection algorithms
- ✅ **Fine-tuned model deployment**

---

## 3. Recommended Backend Options <a id="backend-options"></a>

### Option A: .NET Core (C#) — **Recommended for OriginX Labs**
**Best for**: Enterprise-grade, high-performance, strong typing

```
Pros:
+ Excellent performance (Kestrel server)
+ Strong ecosystem (Entity Framework, SignalR for WebSockets)
+ Native async/streaming support
+ Great for microservices (gRPC support)
+ Azure-native deployment options
+ Mature enterprise patterns

Cons:
- Steeper learning curve if team is JS-focused
- Heavier deployment footprint
```

### Option B: Python (FastAPI) — **Best for AI/ML**
**Best for**: AI-heavy workloads, rapid prototyping

```
Pros:
+ Native AI/ML ecosystem (LangChain, LlamaIndex, transformers)
+ FastAPI has excellent async support
+ Easy model integration
+ Huge community for AI workloads

Cons:
- Slower than .NET for pure API workloads
- GIL limitations for CPU-bound tasks
```

### Option C: Node.js (NestJS) — **Easiest Migration**
**Best for**: Fastest migration path, team already knows JS/TS

```
Pros:
+ Same language as frontend (TypeScript)
+ Easiest migration from edge functions
+ Good streaming support
+ NestJS provides enterprise patterns

Cons:
- Single-threaded (use worker threads for CPU tasks)
- Less mature AI ecosystem than Python
```

### Option D: Go — **Best for Performance**
**Best for**: Maximum throughput, minimal latency

```
Pros:
+ Fastest cold starts
+ Excellent concurrency (goroutines)
+ Minimal memory footprint
+ Great for API gateways

Cons:
- Smaller AI ecosystem
- More verbose code
```

### **My Recommendation: Hybrid Architecture**
```
Python (FastAPI) → AI/ML layer (model routing, embeddings, RAG)
.NET Core        → Business logic, payments, auth, API gateway
```

---

## 4. What to Keep vs Migrate <a id="what-to-keep"></a>

### ✅ KEEP (No Changes Needed):
- **React Frontend** — entire `src/` directory
- **Vercel Deployment** — `vercel.json` config
- **UI Components** — all shadcn/Tailwind components
- **Supabase Auth** — can keep or migrate to custom auth
- **Supabase Database** — can keep PostgreSQL or migrate

### 🔄 MIGRATE (Replace Edge Functions):
| Current Edge Function | New Backend Service |
|----------------------|-------------------|
| `chat/` | AI Router Service (streaming) |
| `model-compare/` | Model Comparison Service |
| `tavily-search/` | Search Aggregation Service |
| `process-document/` | Document Processing Pipeline |
| `memorix-chat/` | RAG + Knowledge Base Service |
| `generate-image/` | Media Generation Service |
| `generate-video/` | Media Generation Service |
| `enhance-prompt/` | Prompt Engineering Service |
| `text-action/` | Text Processing Service |
| `razorpay-*` | Payment Service |
| `send-email/` | Notification Service |

### 🔀 ENHANCE (New Capabilities):
- Vector database for semantic search
- Model health monitoring dashboard
- Response caching layer
- Background job queue
- WebSocket connections for real-time features

---

## 5. Migration Strategy <a id="migration-strategy"></a>

### Phase 1: API Gateway (Week 1-2)
Set up a reverse proxy that routes requests to either edge functions OR new backend. This allows gradual migration.

```
Frontend → API Gateway → Edge Functions (existing)
                       → New Backend (gradually add)
```

### Phase 2: Core AI Router (Week 3-4)
Migrate `chat/` and `model-compare/` to new backend with multi-provider support.

### Phase 3: Document Pipeline (Week 5-6)
Migrate `process-document/` and `memorix-chat/` with vector database.

### Phase 4: Supporting Services (Week 7-8)
Migrate payments, email, and remaining functions.

### Phase 5: Decommission Edge Functions (Week 9)
Remove edge functions, point everything to new backend.

---

## 6. .NET Core Backend Architecture <a id="dotnet-architecture"></a>

### Project Structure:
```
Proxinex.Backend/
├── src/
│   ├── Proxinex.API/                    # API Gateway
│   │   ├── Controllers/
│   │   │   ├── ChatController.cs
│   │   │   ├── ModelCompareController.cs
│   │   │   ├── DocumentController.cs
│   │   │   ├── MemorixController.cs
│   │   │   ├── MediaController.cs
│   │   │   └── PaymentController.cs
│   │   ├── Middleware/
│   │   │   ├── RateLimitingMiddleware.cs
│   │   │   ├── CachingMiddleware.cs
│   │   │   └── AuthMiddleware.cs
│   │   └── Program.cs
│   │
│   ├── Proxinex.AI/                     # AI Router Engine
│   │   ├── Routing/
│   │   │   ├── ModelRouter.cs           # Smart model selection
│   │   │   ├── CostOptimizer.cs         # Cost-based routing
│   │   │   ├── LatencyOptimizer.cs      # Speed-based routing
│   │   │   └── FallbackChain.cs         # Provider failover
│   │   ├── Providers/
│   │   │   ├── IModelProvider.cs        # Interface
│   │   │   ├── OpenAIProvider.cs
│   │   │   ├── AnthropicProvider.cs
│   │   │   ├── GoogleProvider.cs
│   │   │   ├── MistralProvider.cs
│   │   │   ├── OllamaProvider.cs        # Open-source models
│   │   │   └── VLLMProvider.cs          # Self-hosted models
│   │   ├── Streaming/
│   │   │   └── SSEStreamWriter.cs
│   │   └── Models/
│   │       ├── ModelCapability.cs
│   │       └── RoutingDecision.cs
│   │
│   ├── Proxinex.Documents/             # Document Pipeline
│   │   ├── Ingestion/
│   │   │   ├── PDFParser.cs
│   │   │   ├── OCRProcessor.cs
│   │   │   └── ChunkingStrategy.cs
│   │   ├── Embeddings/
│   │   │   ├── EmbeddingService.cs
│   │   │   └── VectorStore.cs           # Qdrant/pgvector
│   │   └── RAG/
│   │       ├── RetrievalService.cs
│   │       └── ContextBuilder.cs
│   │
│   ├── Proxinex.Payments/              # Payment Service
│   │   ├── RazorpayService.cs
│   │   └── SubscriptionManager.cs
│   │
│   └── Proxinex.Core/                  # Shared
│       ├── Models/
│       ├── Interfaces/
│       └── Configuration/
│
├── tests/
│   ├── Proxinex.AI.Tests/
│   └── Proxinex.API.Tests/
│
├── docker-compose.yml
├── Dockerfile
└── Proxinex.sln
```

### Key Controller Example (ChatController.cs):
```csharp
[ApiController]
[Route("api/v1/chat")]
public class ChatController : ControllerBase
{
    private readonly IModelRouter _router;
    private readonly ICacheService _cache;

    [HttpPost("completions")]
    public async Task StreamChat([FromBody] ChatRequest request)
    {
        Response.ContentType = "text/event-stream";
        
        // Smart routing based on query complexity, cost, latency
        var routingDecision = await _router.Route(request);
        
        await foreach (var chunk in routingDecision.Provider.StreamAsync(request))
        {
            await Response.WriteAsync($"data: {JsonSerializer.Serialize(chunk)}\n\n");
            await Response.Body.FlushAsync();
        }
        
        await Response.WriteAsync("data: [DONE]\n\n");
    }
}
```

---

## 7. Model Routing Engine Design <a id="model-routing"></a>

### Smart Routing Algorithm:
```
User Query → Classify Complexity → Select Optimal Model → Execute → Fallback if needed

Classification:
- Simple (FAQ, translation)     → Fast/cheap model (Gemini Flash, GPT-5-nano)
- Medium (analysis, coding)     → Balanced model (GPT-5-mini, Claude Sonnet)
- Complex (research, reasoning) → Premium model (GPT-5, Claude Opus, Gemini Pro)
- Creative (writing, brainstorm) → Creative model (Claude, GPT-5)
- Visual (image understanding)  → Multimodal (Gemini Pro, GPT-5 Vision)
```

### Provider Health Monitoring:
```
┌──────────────────────────────────────────┐
│           Model Router                    │
│                                          │
│  ┌─────────┐  ┌──────────┐  ┌────────┐ │
│  │ OpenAI  │  │ Anthropic│  │ Google │ │
│  │ ██████░ │  │ ████████ │  │ ██████ │ │
│  │ 95% up  │  │ 99% up   │  │ 97% up │ │
│  └─────────┘  └──────────┘  └────────┘ │
│  ┌─────────┐  ┌──────────┐  ┌────────┐ │
│  │ Mistral │  │  Ollama  │  │  vLLM  │ │
│  │ ████░░░ │  │ ████████ │  │ ██████ │ │
│  │ 92% up  │  │ 100% up  │  │ 98% up │ │
│  └─────────┘  └──────────┘  └────────┘ │
└──────────────────────────────────────────┘
```

---

## 8. Open & Closed Source Model Integration <a id="model-integration"></a>

### Currently Implemented (via Lovable AI Gateway):
| Model | Provider | Type | Status |
|-------|----------|------|--------|
| Gemini 2.5 Flash | Google | Closed | ✅ Active |
| Gemini 2.5 Pro | Google | Closed | ✅ Active |
| GPT-5 | OpenAI | Closed | ✅ Active |
| GPT-5 Mini | OpenAI | Closed | ✅ Active |

### Available After Migration:

#### Closed Source:
| Model | Provider | Best For |
|-------|----------|----------|
| GPT-5, GPT-5-mini, GPT-5-nano | OpenAI | General, reasoning |
| Claude 4 Opus, Sonnet, Haiku | Anthropic | Writing, analysis, code |
| Gemini 2.5 Pro/Flash | Google | Multimodal, large context |
| Mistral Large, Medium | Mistral | European compliance, code |
| Command R+ | Cohere | RAG, enterprise search |

#### Open Source (Self-hosted via vLLM/Ollama):
| Model | Parameters | Best For |
|-------|-----------|----------|
| Llama 3.1 405B | 405B | GPT-4 alternative |
| Llama 3.1 70B | 70B | Balanced performance |
| Llama 3.1 8B | 8B | Fast, edge deployment |
| Mixtral 8x22B | 141B MoE | Code, math |
| DeepSeek V3 | 671B MoE | Code, reasoning |
| Qwen 2.5 72B | 72B | Multilingual |
| Phi-3 Medium | 14B | Compact, efficient |

### Self-Hosting Architecture:
```
┌──────────────────────────────────────┐
│        GPU Server (A100/H100)        │
│                                      │
│  ┌────────────┐  ┌────────────────┐ │
│  │   vLLM     │  │    Ollama      │ │
│  │            │  │                │ │
│  │ Llama 405B │  │ Llama 8B       │ │
│  │ DeepSeek   │  │ Phi-3          │ │
│  │ Mixtral    │  │ Mistral 7B     │ │
│  └────────────┘  └────────────────┘ │
│                                      │
│  Endpoint: http://gpu-server:8000    │
└──────────────────────────────────────┘
```

---

## 9. API Contract (Keep UI Compatible) <a id="api-contract"></a>

### Frontend Changes Required:
The ONLY change needed in the frontend is updating the API base URL:

```typescript
// Current (edge functions):
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

// After migration:
const API_BASE = import.meta.env.VITE_API_URL; // e.g., https://api.proxinex.com
const CHAT_URL = `${API_BASE}/v1/chat/completions`;
```

### Keep Same Response Format:
Your new backend MUST return the same SSE format:
```
data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"choices":[{"delta":{"content":" world"}}]}
data: [DONE]
```

### Environment Variables to Add:
```env
VITE_API_URL=https://api.proxinex.com
```

---

## 10. Step-by-Step Migration Plan <a id="step-by-step"></a>

### Step 1: Set Up New Backend
```bash
# .NET Core
dotnet new webapi -n Proxinex.API
# OR Python
pip install fastapi uvicorn langchain
# OR Node.js
npx @nestjs/cli new proxinex-backend
```

### Step 2: Implement API Gateway with CORS
Match the exact CORS headers currently used by edge functions.

### Step 3: Add Environment Variable to Frontend
```typescript
// Add to .env
VITE_API_URL=https://api.proxinex.com

// Create src/lib/api.ts
export const API_BASE = import.meta.env.VITE_API_URL || 
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
```

### Step 4: Create Adapter Pattern
```typescript
// src/lib/api.ts - Single place to swap backends
export async function chatStream(messages: Message[]) {
  return fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
}
```

### Step 5: Migrate Functions One by One
Replace each edge function call with the new API endpoint while keeping the same request/response contract.

### Step 6: Set Up CI/CD
```yaml
# GitHub Actions for .NET
- name: Build
  run: dotnet build
- name: Test
  run: dotnet test
- name: Deploy
  run: docker push proxinex-api:latest
```

### Step 7: Deploy
- **Azure**: App Service or AKS for .NET
- **AWS**: ECS/Fargate or Lambda
- **GCP**: Cloud Run or GKE
- **Self-hosted**: Docker Compose on VPS

---

## Infrastructure Recommendations

### For Production:
```
┌─────────────────────────────────────────────────┐
│                  CloudFlare CDN                  │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│              Load Balancer (Nginx)               │
└──────┬───────────────┬──────────────────────────┘
       │               │
┌──────▼──────┐ ┌──────▼──────┐
│  API Node 1 │ │  API Node 2 │  (.NET/Python)
└──────┬──────┘ └──────┬──────┘
       │               │
┌──────▼───────────────▼──────┐
│      PostgreSQL (Supabase   │
│      or self-hosted)        │
├─────────────────────────────┤
│      Redis (caching +       │
│      rate limiting)         │
├─────────────────────────────┤
│      Qdrant (vectors for    │
│      Memorix semantic search│
├─────────────────────────────┤
│      RabbitMQ/Redis Queue   │
│      (background jobs)      │
└─────────────────────────────┘
```

---

## Summary

| Aspect | Current | After Migration |
|--------|---------|----------------|
| Models | 4 (via gateway) | 15+ (open + closed) |
| Latency | 200-500ms cold start | <50ms warm |
| Streaming | SSE only | SSE + WebSocket |
| Document Search | Keyword only | Semantic (vector) |
| Caching | None | Redis layer |
| Rate Limiting | Gateway-dependent | Custom control |
| Background Jobs | Not possible | Full support |
| Self-hosted Models | Not possible | vLLM/Ollama |
| Cost Control | Per-request | Granular metering |

---

*© 2026 OriginX Labs PVT. LTD. All rights reserved.*
*Proxinex is a product of OriginX Labs.*
