import { useState, useEffect } from "react";
import { MessageSquare, CheckCircle, ExternalLink, Sparkles } from "lucide-react";
import { ProxinexIcon } from "@/components/Logo";

interface Citation {
  id: number;
  text: string;
  source: string;
  url: string;
}

const sampleResponse = {
  question: "What are the key benefits of quantum computing?",
  answer: `Quantum computing offers several transformative advantages over classical computing. The most significant benefit is <cite data-id="1">quantum parallelism</cite>, which allows quantum computers to process vast numbers of possibilities simultaneously.

Another key advantage is <cite data-id="2">exponential speedup for specific algorithms</cite>, particularly in cryptography, drug discovery, and optimization problems.

Additionally, <cite data-id="3">quantum entanglement enables instant correlation</cite> between qubits, creating computational capabilities impossible with classical bits.`,
  citations: [
    { id: 1, text: "quantum parallelism", source: "MIT Technology Review", url: "#" },
    { id: 2, text: "exponential speedup for specific algorithms", source: "Nature Physics Journal", url: "#" },
    { id: 3, text: "quantum entanglement enables instant correlation", source: "IBM Research", url: "#" }
  ] as Citation[],
  accuracy: 94,
  model: "Claude 3.5 Sonnet",
  cost: "₹0.024"
};

export const HeroLivePreview = () => {
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [showInlineAsk, setShowInlineAsk] = useState(false);
  const [inlineQuestion, setInlineQuestion] = useState("");
  const [highlightedText, setHighlightedText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Simulate typing effect for demo
  useEffect(() => {
    const text = "Can you explain this in simpler terms?";
    if (showInlineAsk && typingIndex < text.length) {
      const timeout = setTimeout(() => {
        setInlineQuestion(text.slice(0, typingIndex + 1));
        setTypingIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
    if (typingIndex === text.length) {
      setTimeout(() => setShowAnswer(true), 500);
    }
  }, [showInlineAsk, typingIndex]);

  // Demo interaction cycle
  useEffect(() => {
    const cycle = () => {
      // Step 1: Show citation hover
      setTimeout(() => {
        setSelectedCitation(sampleResponse.citations[0]);
      }, 2000);

      // Step 2: Hide citation, simulate text selection
      setTimeout(() => {
        setSelectedCitation(null);
        setHighlightedText("quantum parallelism");
        setShowInlineAsk(true);
      }, 4000);

      // Step 3: Reset and repeat
      setTimeout(() => {
        setShowInlineAsk(false);
        setHighlightedText("");
        setInlineQuestion("");
        setTypingIndex(0);
        setShowAnswer(false);
      }, 10000);
    };

    cycle();
    const interval = setInterval(cycle, 12000);
    return () => clearInterval(interval);
  }, []);

  const renderAnswer = () => {
    let html = sampleResponse.answer;
    sampleResponse.citations.forEach(citation => {
      const regex = new RegExp(`<cite data-id="${citation.id}">(.*?)</cite>`, 'g');
      const isHighlighted = highlightedText === citation.text;
      html = html.replace(regex, (_, text) => 
        `<span class="citation-link cursor-pointer transition-all ${
          selectedCitation?.id === citation.id 
            ? 'text-primary underline decoration-primary' 
            : isHighlighted 
              ? 'bg-primary/30 text-foreground px-1 rounded'
              : 'text-primary/80 hover:text-primary border-b border-dashed border-primary/50'
        }" data-citation-id="${citation.id}">${text}</span>`
      );
    });
    return html;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Browser Chrome */}
      <div className="rounded-t-xl bg-secondary border border-border border-b-0 p-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-background rounded-md px-3 py-1.5 text-sm text-muted-foreground flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
              <ProxinexIcon className="w-3 h-3 text-primary" />
            </div>
            <span>app.proxinex.com/chat</span>
          </div>
        </div>
      </div>

      {/* Chat Interface Preview */}
      <div className="rounded-b-xl bg-card border border-border p-6 min-h-[400px] relative overflow-hidden">
        {/* User Question */}
        <div className="flex gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">U</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground">{sampleResponse.question}</p>
          </div>
        </div>

        {/* AI Response */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <ProxinexIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 space-y-3">
            {/* Answer Content */}
            <div 
              className="text-sm text-foreground/90 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderAnswer() }}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                const citationId = target.dataset.citationId;
                if (citationId) {
                  const citation = sampleResponse.citations.find(c => c.id === parseInt(citationId));
                  setSelectedCitation(citation || null);
                }
              }}
            />

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle className="w-3 h-3" />
                <span>{sampleResponse.accuracy}% Accuracy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Model:</span>
                <span className="text-foreground">{sampleResponse.model}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Cost:</span>
                <span className="text-foreground">{sampleResponse.cost}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Citation Tooltip */}
        {selectedCitation && (
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-64 p-4 rounded-lg bg-popover border border-border shadow-xl animate-scale-in z-20">
            <div className="flex items-start gap-2 mb-2">
              <ExternalLink className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{selectedCitation.source}</p>
                <p className="text-xs text-muted-foreground">Click to view source</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 p-2 rounded bg-secondary">
              "{selectedCitation.text}"
            </p>
          </div>
        )}

        {/* Inline Ask Demo */}
        {showInlineAsk && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-80 animate-fade-up z-20">
            <div className="p-4 rounded-lg bg-popover border border-primary/50 shadow-xl shadow-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Inline Ask™</span>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Selected: "<span className="text-primary">{highlightedText}</span>"
              </div>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={inlineQuestion}
                  readOnly
                  placeholder="Ask about this..."
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md text-foreground"
                />
                <button className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
              {showAnswer && (
                <div className="mt-3 p-3 rounded bg-secondary text-xs text-foreground animate-fade-up">
                  <p>Quantum parallelism means a quantum computer can evaluate multiple solutions at once, rather than checking them one by one like a regular computer.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Labels */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Live Preview
          </div>
        </div>
      </div>

      {/* Feature Indicators */}
      <div className="flex justify-center gap-6 mt-6">
        <div className={`flex items-center gap-2 text-sm transition-all ${selectedCitation ? 'text-primary' : 'text-muted-foreground'}`}>
          <ExternalLink className="w-4 h-4" />
          <span>Citation Verification</span>
        </div>
        <div className={`flex items-center gap-2 text-sm transition-all ${showInlineAsk ? 'text-primary' : 'text-muted-foreground'}`}>
          <Sparkles className="w-4 h-4" />
          <span>Inline Ask™</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="w-4 h-4" />
          <span>Accuracy Scoring</span>
        </div>
      </div>
    </div>
  );
};
