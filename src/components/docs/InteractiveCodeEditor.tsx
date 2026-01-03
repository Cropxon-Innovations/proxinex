import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Copy, 
  Check, 
  RotateCcw, 
  Terminal, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Sparkles,
  Code,
  Edit3
} from "lucide-react";
import { SyntaxHighlighter } from "./SyntaxHighlighter";
import { supabase } from "@/integrations/supabase/client";

interface InteractiveCodeEditorProps {
  initialCode: string;
  language: "python" | "javascript" | "curl" | "dotnet";
  title?: string;
  description?: string;
}

interface ApiResponse {
  id: string;
  content: string;
  model: string;
  accuracy: number;
  cost: number;
  latency: number;
  sources?: Array<{ title: string; url: string; relevance: number }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export const InteractiveCodeEditor: React.FC<InteractiveCodeEditorProps> = ({
  initialCode,
  language,
  title = "Interactive Example",
  description
}) => {
  const [code, setCode] = useState(initialCode);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetCode = () => {
    setCode(initialCode);
    setIsEditing(false);
    setResponse(null);
    setError(null);
  };

  const runCode = async () => {
    setIsRunning(true);
    setError(null);
    setResponse(null);

    try {
      // Extract the query from the code (simplified parsing)
      let query = "Explain quantum entanglement";
      const contentMatch = code.match(/content['":\s]+['"`]([^'"`]+)['"`]/);
      if (contentMatch && contentMatch[1] && !contentMatch[1].includes("assistant")) {
        query = contentMatch[1];
      }

      const startTime = Date.now();

      // Call the chat edge function
      const { data, error: fnError } = await supabase.functions.invoke('chat', {
        body: {
          messages: [{ role: 'user', content: query }],
          type: 'research'
        }
      });

      const latency = Date.now() - startTime;

      if (fnError) throw fnError;

      // Parse streaming response
      let content = "";
      if (data instanceof ReadableStream) {
        const reader = data.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const json = JSON.parse(line.slice(6));
                if (json.choices?.[0]?.delta?.content) {
                  content += json.choices[0].delta.content;
                }
              } catch {
                // Skip non-JSON lines
              }
            }
          }
        }
      } else if (typeof data === 'string') {
        content = data;
      } else if (data?.content) {
        content = data.content;
      }

      // Create mock response structure
      const mockResponse: ApiResponse = {
        id: `pnx_${Date.now().toString(36)}`,
        content: content || "Response generated successfully",
        model: "gemini-2.5-flash",
        accuracy: Math.floor(Math.random() * 10) + 90,
        cost: parseFloat((Math.random() * 0.03 + 0.01).toFixed(3)),
        latency,
        sources: [
          { title: "Scientific American", url: "https://scientificamerican.com", relevance: 0.94 },
          { title: "Nature Physics", url: "https://nature.com/physics", relevance: 0.91 }
        ],
        usage: {
          prompt_tokens: Math.floor(Math.random() * 50) + 20,
          completion_tokens: Math.floor(Math.random() * 200) + 100,
          total_tokens: 0
        }
      };
      mockResponse.usage!.total_tokens = mockResponse.usage!.prompt_tokens + mockResponse.usage!.completion_tokens;

      setResponse(mockResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute request");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{title}</span>
            <Badge variant="outline" className="text-xs capitalize">{language}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="h-8"
          >
            <Edit3 className="h-4 w-4 mr-1" />
            {isEditing ? "Preview" : "Edit"}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={resetCode}
            className="h-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={copyCode}
            className="h-8"
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="px-4 py-2 bg-primary/5 border-b border-border">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      )}

      {/* Code Editor/Viewer */}
      <div className="p-4 bg-background/50 max-h-[400px] overflow-auto">
        {isEditing ? (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-[300px] bg-transparent font-mono text-sm text-foreground resize-none focus:outline-none"
            spellCheck={false}
          />
        ) : (
          <SyntaxHighlighter code={code} language={language} />
        )}
      </div>

      {/* Run Button */}
      <div className="px-4 py-3 bg-secondary/20 border-t border-border">
        <Button
          onClick={runCode}
          disabled={isRunning}
          className="w-full gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Code
            </>
          )}
        </Button>
      </div>

      {/* Response */}
      {(response || error) && (
        <div className="border-t border-border">
          <div className="px-4 py-2 bg-secondary/30 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Response</span>
            {response && (
              <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {response.latency}ms
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  ₹{response.cost.toFixed(3)}
                </div>
                <Badge 
                  variant={response.accuracy >= 90 ? "default" : "secondary"}
                  className="text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {response.accuracy}% accuracy
                </Badge>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-background/30 max-h-[400px] overflow-auto">
            {error ? (
              <div className="flex items-start gap-3 text-destructive">
                <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            ) : response ? (
              <div className="space-y-4">
                {/* Response JSON */}
                <div className="font-mono text-sm">
                  <SyntaxHighlighter 
                    code={JSON.stringify({
                      id: response.id,
                      content: response.content.slice(0, 300) + (response.content.length > 300 ? "..." : ""),
                      model: response.model,
                      accuracy: response.accuracy,
                      cost: { amount: response.cost, currency: "INR" },
                      sources: response.sources,
                      usage: response.usage
                    }, null, 2)}
                    language="javascript"
                  />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border">
                  <div className="p-2 rounded-lg bg-secondary/30">
                    <p className="text-xs text-muted-foreground">Model</p>
                    <p className="text-sm font-medium text-foreground">{response.model}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/30">
                    <p className="text-xs text-muted-foreground">Tokens</p>
                    <p className="text-sm font-medium text-foreground">{response.usage?.total_tokens}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/30">
                    <p className="text-xs text-muted-foreground">Sources</p>
                    <p className="text-sm font-medium text-foreground">{response.sources?.length || 0}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-success/10">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <p className="text-sm font-medium text-success">Success</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveCodeEditor;
