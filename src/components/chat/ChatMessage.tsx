import { useState, useEffect } from "react";
import { 
  Clock, 
  DollarSign, 
  CheckCircle, 
  ExternalLink,
  Sparkles,
  Cpu,
  Copy,
  Check,
  BookOpen,
  Code,
  Table,
  List,
  Quote,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Zap,
  FileText,
  Pin,
} from "lucide-react";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { FeedbackActions } from "@/components/chat/FeedbackActions";
import { SourcesDisplay, Source } from "@/components/chat/SourcesDisplay";
import { ProxinexIcon } from "@/components/Logo";
import { toast } from "sonner";

// Code copy button component
const CodeCopyButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    toast.success("Code copied to clipboard!", {
      description: `${code.trim().split('\n').length} lines copied`,
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-all"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>Copy code</span>
        </>
      )}
    </button>
  );
};

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isLoading?: boolean;
  accuracy?: number;
  cost?: number;
  model?: string;
  sources?: Source[];
  verified?: boolean;
  isPinned?: boolean;
  onCopy?: () => void;
  onFeedback?: (type: "up" | "down" | "love", reason?: string) => void;
  onPin?: () => void;
}

// Tokenize code for syntax highlighting
function tokenizeCode(code: string, language: string): JSX.Element[] {
  const elements: JSX.Element[] = [];
  
  // Keywords by language
  const keywords: Record<string, string[]> = {
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'super', 'extends', 'static', 'get', 'set', 'of', 'in', 'typeof', 'instanceof', 'true', 'false', 'null', 'undefined'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'super', 'extends', 'static', 'get', 'set', 'of', 'in', 'typeof', 'instanceof', 'true', 'false', 'null', 'undefined', 'interface', 'type', 'enum', 'implements', 'private', 'public', 'protected', 'readonly', 'as', 'is', 'keyof', 'infer', 'never', 'unknown', 'any', 'void'],
    python: ['def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'lambda', 'yield', 'raise', 'pass', 'break', 'continue', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None', 'self', 'async', 'await'],
    sql: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TABLE', 'INDEX', 'VIEW', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'NULL', 'AS', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'BETWEEN', 'LIKE', 'IN', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'VALUES', 'SET'],
    bash: ['if', 'then', 'else', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'function', 'return', 'exit', 'echo', 'export', 'source', 'alias', 'cd', 'pwd', 'ls', 'rm', 'cp', 'mv', 'mkdir', 'chmod', 'chown', 'grep', 'sed', 'awk', 'cat', 'head', 'tail', 'curl', 'wget'],
    json: [],
    html: [],
    css: [],
  };
  
  const langKeywords = keywords[language.toLowerCase()] || keywords.javascript;
  const lines = code.split('\n');
  
  lines.forEach((line, lineIndex) => {
    let i = 0;
    const lineElements: JSX.Element[] = [];
    
    while (i < line.length) {
      // Check for comments
      if (line.slice(i).startsWith('//') || line.slice(i).startsWith('#')) {
        lineElements.push(
          <span key={`${lineIndex}-comment-${i}`} className="text-emerald-400 italic">
            {line.slice(i)}
          </span>
        );
        break;
      }
      
      // Check for strings (double quotes)
      if (line[i] === '"' || line[i] === "'") {
        const quote = line[i];
        let end = i + 1;
        while (end < line.length && (line[end] !== quote || line[end - 1] === '\\')) {
          end++;
        }
        end++;
        lineElements.push(
          <span key={`${lineIndex}-str-${i}`} className="text-amber-400">
            {line.slice(i, end)}
          </span>
        );
        i = end;
        continue;
      }
      
      // Check for template literals
      if (line[i] === '`') {
        let end = i + 1;
        while (end < line.length && line[end] !== '`') {
          end++;
        }
        end++;
        lineElements.push(
          <span key={`${lineIndex}-tpl-${i}`} className="text-amber-400">
            {line.slice(i, end)}
          </span>
        );
        i = end;
        continue;
      }
      
      // Check for numbers
      if (/\d/.test(line[i]) && (i === 0 || !/\w/.test(line[i - 1]))) {
        let end = i;
        while (end < line.length && /[\d.x]/.test(line[end])) {
          end++;
        }
        lineElements.push(
          <span key={`${lineIndex}-num-${i}`} className="text-purple-400">
            {line.slice(i, end)}
          </span>
        );
        i = end;
        continue;
      }
      
      // Check for keywords
      let foundKeyword = false;
      for (const keyword of langKeywords) {
        if (line.slice(i).toLowerCase().startsWith(keyword.toLowerCase())) {
          const nextChar = line[i + keyword.length];
          if (!nextChar || !/\w/.test(nextChar)) {
            lineElements.push(
              <span key={`${lineIndex}-kw-${i}`} className="text-pink-400 font-semibold">
                {line.slice(i, i + keyword.length)}
              </span>
            );
            i += keyword.length;
            foundKeyword = true;
            break;
          }
        }
      }
      if (foundKeyword) continue;
      
      // Check for function calls
      if (/[a-zA-Z_]/.test(line[i])) {
        let end = i;
        while (end < line.length && /\w/.test(line[end])) {
          end++;
        }
        const word = line.slice(i, end);
        const isFunction = line[end] === '(';
        const isType = /^[A-Z]/.test(word);
        
        if (isFunction) {
          lineElements.push(
            <span key={`${lineIndex}-fn-${i}`} className="text-blue-400">
              {word}
            </span>
          );
        } else if (isType) {
          lineElements.push(
            <span key={`${lineIndex}-type-${i}`} className="text-cyan-400">
              {word}
            </span>
          );
        } else {
          lineElements.push(
            <span key={`${lineIndex}-id-${i}`} className="text-foreground">
              {word}
            </span>
          );
        }
        i = end;
        continue;
      }
      
      // Operators and punctuation
      if (/[{}()\[\];:,.<>=!+\-*/%&|^~?]/.test(line[i])) {
        lineElements.push(
          <span key={`${lineIndex}-op-${i}`} className="text-muted-foreground">
            {line[i]}
          </span>
        );
        i++;
        continue;
      }
      
      // Regular characters
      lineElements.push(
        <span key={`${lineIndex}-char-${i}`}>{line[i]}</span>
      );
      i++;
    }
    
    elements.push(
      <div key={`line-${lineIndex}`} className="leading-relaxed">
        <span className="inline-block w-8 text-right mr-4 text-muted-foreground/50 select-none text-xs">
          {lineIndex + 1}
        </span>
        {lineElements}
      </div>
    );
  });
  
  return elements;
}

// Get icon for section header
function getSectionIcon(headerText: string): JSX.Element | null {
  const text = headerText.toLowerCase();
  if (text.includes('overview') || text.includes('summary')) return <Lightbulb className="h-4 w-4 text-yellow-400" />;
  if (text.includes('comparison') || text.includes('compare') || text.includes('vs')) return <BarChart3 className="h-4 w-4 text-blue-400" />;
  if (text.includes('code') || text.includes('example') || text.includes('implementation')) return <Code className="h-4 w-4 text-green-400" />;
  if (text.includes('feature') || text.includes('benefit')) return <Zap className="h-4 w-4 text-purple-400" />;
  if (text.includes('source') || text.includes('reference')) return <BookOpen className="h-4 w-4 text-orange-400" />;
  if (text.includes('note') || text.includes('important') || text.includes('warning')) return <AlertCircle className="h-4 w-4 text-red-400" />;
  if (text.includes('list') || text.includes('step')) return <List className="h-4 w-4 text-cyan-400" />;
  if (text.includes('table') || text.includes('data')) return <Table className="h-4 w-4 text-indigo-400" />;
  if (text.includes('conclusion') || text.includes('result')) return <FileText className="h-4 w-4 text-teal-400" />;
  return <Sparkles className="h-4 w-4 text-primary" />;
}

export const ChatMessage = ({
  role,
  content,
  timestamp,
  isLoading,
  accuracy = 85,
  cost = 0.012,
  model = "Gemini 2.5 Flash",
  sources = [],
  verified = true,
  isPinned = false,
  onCopy,
  onFeedback,
  onPin,
}: ChatMessageProps) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);

  // Typing animation effect for assistant messages
  useEffect(() => {
    if (role === "assistant" && content && !isLoading) {
      setIsTyping(true);
      let index = 0;
      const typingSpeed = 5;
      
      if (content.length < 50 || displayedContent === content) {
        setDisplayedContent(content);
        setIsTyping(false);
        return;
      }

      const timer = setInterval(() => {
        if (index <= content.length) {
          setDisplayedContent(content.slice(0, index));
          index += 3;
        } else {
          clearInterval(timer);
          setDisplayedContent(content);
          setIsTyping(false);
        }
      }, typingSpeed);

      return () => clearInterval(timer);
    } else if (isLoading) {
      setDisplayedContent(content);
    }
  }, [content, role, isLoading]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  if (role === "user") {
    return (
      <div className="flex justify-end mb-4 group">
        <div className="relative bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md max-w-md">
          <p className="text-sm">{content}</p>
          {onPin && (
            <button
              onClick={onPin}
              className={`absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${
                isPinned 
                  ? "bg-primary/20 text-primary opacity-100" 
                  : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary hover:bg-primary/10"
              }`}
              title={isPinned ? "Unpin message" : "Pin message"}
            >
              <Pin className={`h-3.5 w-3.5 ${isPinned ? "fill-current" : ""}`} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Parse and render markdown content with enhanced formatting
  const renderContent = () => {
    const text = displayedContent || content;
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeContent = '';
    let codeLanguage = '';
    let inTable = false;
    let tableRows: string[][] = [];
    let listItems: string[] = [];
    let inBlockquote = false;
    let blockquoteContent: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-2 mb-4 ml-1">
            {listItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const flushTable = () => {
      if (tableRows.length > 1) {
        const headers = tableRows[0];
        const body = tableRows.slice(2); // Skip header separator row
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto mb-4 rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-primary/10">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-left font-semibold text-primary border-b border-border">
                      {h.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-card' : 'bg-secondary/30'}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-2.5 text-foreground/90 border-b border-border">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    };

    const flushBlockquote = () => {
      if (blockquoteContent.length > 0) {
        elements.push(
          <blockquote key={`quote-${elements.length}`} className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4 bg-primary/5 py-3 rounded-r-lg flex items-start gap-3">
            <Quote className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>{blockquoteContent.join(' ')}</div>
          </blockquote>
        );
        blockquoteContent = [];
        inBlockquote = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <div key={`code-${elements.length}`} className="relative mb-4 group">
              <div className="flex items-center justify-between px-4 py-2 bg-secondary border border-border rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {codeLanguage || 'code'}
                  </span>
                </div>
                <CodeCopyButton code={codeContent} />
              </div>
              <pre className="bg-[#1e1e2e] border border-t-0 border-border rounded-b-lg p-4 overflow-x-auto">
                <code className="text-xs font-mono">
                  {tokenizeCode(codeContent.trim(), codeLanguage)}
                </code>
              </pre>
            </div>
          );
          inCodeBlock = false;
          codeContent = '';
          codeLanguage = '';
        } else {
          flushList();
          flushTable();
          flushBlockquote();
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
        }
        continue;
      }
      
      if (inCodeBlock) {
        codeContent += line + '\n';
        continue;
      }
      
      // Table rows
      if (line.includes('|') && line.trim().startsWith('|')) {
        flushList();
        flushBlockquote();
        inTable = true;
        const cells = line.split('|').filter(c => c.trim() !== '');
        // Skip separator rows
        if (!line.match(/^\|[\s\-:]+\|/)) {
          tableRows.push(cells);
        } else {
          tableRows.push([]); // Placeholder for separator
        }
        continue;
      } else if (inTable) {
        flushTable();
      }
      
      // Blockquotes
      if (line.startsWith('>')) {
        flushList();
        flushTable();
        inBlockquote = true;
        blockquoteContent.push(line.slice(1).trim());
        continue;
      } else if (inBlockquote) {
        flushBlockquote();
      }
      
      // Headers
      if (line.startsWith('## ')) {
        flushList();
        flushTable();
        flushBlockquote();
        const headerText = line.slice(3).replace(/^[^\w\s]+\s*/, ''); // Remove leading emojis
        elements.push(
          <h2 key={`h2-${elements.length}`} className="text-lg font-semibold text-primary mb-3 mt-5 flex items-center gap-2 border-b border-border/50 pb-2">
            {getSectionIcon(headerText)}
            <span>{headerText}</span>
          </h2>
        );
        continue;
      }
      
      if (line.startsWith('### ')) {
        flushList();
        flushTable();
        flushBlockquote();
        const headerText = line.slice(4).replace(/^[^\w\s]+\s*/, '');
        elements.push(
          <h3 key={`h3-${elements.length}`} className="text-base font-medium text-foreground mb-2 mt-4 flex items-center gap-2">
            {getSectionIcon(headerText)}
            <span>{headerText}</span>
          </h3>
        );
        continue;
      }
      
      if (line.startsWith('# ')) {
        flushList();
        flushTable();
        flushBlockquote();
        const headerText = line.slice(2).replace(/^[^\w\s]+\s*/, '');
        elements.push(
          <h1 key={`h1-${elements.length}`} className="text-xl font-bold text-foreground mb-3 mt-0 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>{headerText}</span>
          </h1>
        );
        continue;
      }
      
      // List items
      if (line.match(/^[\-\*]\s/) || line.match(/^\d+\.\s/)) {
        flushTable();
        flushBlockquote();
        const itemText = line.replace(/^[\-\*]\s/, '').replace(/^\d+\.\s/, '');
        listItems.push(itemText);
        continue;
      } else if (listItems.length > 0 && line.trim() === '') {
        flushList();
        continue;
      }
      
      // Empty lines
      if (line.trim() === '') {
        flushList();
        elements.push(<div key={`br-${elements.length}`} className="h-2" />);
        continue;
      }
      
      // Regular paragraph with inline formatting
      flushList();
      flushTable();
      flushBlockquote();
      
      let formattedLine = line;
      // Bold
      formattedLine = formattedLine.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>');
      // Inline code
      formattedLine = formattedLine.replace(/`([^`]+)`/g, '<code class="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono border border-primary/20">$1</code>');
      // Links
      formattedLine = formattedLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');
      // Citations
      formattedLine = formattedLine.replace(/\[(\d+)\]/g, '<sup class="text-primary font-semibold cursor-pointer hover:text-primary/80">[$1]</sup>');
      
      elements.push(
        <p 
          key={`p-${elements.length}`} 
          className="text-sm leading-relaxed mb-3 text-foreground/90"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    }
    
    // Flush any remaining content
    flushList();
    flushTable();
    flushBlockquote();
    
    return elements;
  };

  return (
    <div className="mb-6 animate-fade-in">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-secondary/20">
          <div className="relative">
            <ProxinexIcon className={`w-7 h-7 ${isLoading ? "animate-pulse" : ""}`} />
            {isLoading && (
              <div className="absolute inset-0 rounded-lg border-2 border-primary/50 animate-ping" />
            )}
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-foreground">Proxinex</span>
            <span className="text-xs text-muted-foreground ml-2">
              <Cpu className="h-3 w-3 inline mr-1" />
              {model}
            </span>
          </div>
          {!isLoading && (
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-secondary transition-colors"
              title="Copy response"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4 animate-spin" />
              <span className="text-xs">Thinking...</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {isLoading && !content ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-sm">Generating response...</span>
            </div>
          ) : (
            <div className="prose-custom">
              {renderContent()}
              {(isLoading || isTyping) && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 rounded" />
              )}
            </div>
          )}
        </div>

        {/* Inline Sources */}
        {sources.length > 0 && !isLoading && (
          <div className="px-5 pb-3">
            <SourcesDisplay sources={sources} inline />
          </div>
        )}

        {/* Trust Bar */}
        {!isLoading && content && (
          <div className="px-5 py-3 border-t border-border bg-secondary/30 flex flex-wrap items-center gap-4 text-sm">
            <ConfidenceBadge score={accuracy} />
            
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">LIVE</span>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="text-xs">₹{cost.toFixed(3)}</span>
            </div>

            {verified && (
              <div className="flex items-center gap-1.5 text-green-500">
                <CheckCircle className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Verified</span>
              </div>
            )}

            {sources.length > 0 && (
              <div className="flex items-center gap-1.5 text-primary">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="text-xs">{sources.length} sources</span>
              </div>
            )}

            <div className="flex-1" />

            {onPin && (
              <button
                onClick={onPin}
                className={`p-1.5 rounded transition-colors ${
                  isPinned 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                }`}
                title={isPinned ? "Unpin message" : "Pin message"}
              >
                <Pin className={`h-3.5 w-3.5 ${isPinned ? "fill-current" : ""}`} />
              </button>
            )}

            <FeedbackActions content={content} onFeedback={onFeedback} />
          </div>
        )}

        {/* Full Sources Section */}
        {sources.length > 0 && !isLoading && (
          <div className="px-5 py-4 border-t border-border bg-card">
            <SourcesDisplay sources={sources} />
          </div>
        )}
      </div>
    </div>
  );
};
