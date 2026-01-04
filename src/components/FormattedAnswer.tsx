import { Fragment, useMemo } from "react";
import { EnhancedCitationTooltip, Citation } from "./EnhancedCitationTooltip";
import { 
  Lightbulb, 
  Target, 
  Zap, 
  Star, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Brain,
  Rocket,
  Heart,
  Shield,
  Clock,
  Award
} from "lucide-react";

interface FormattedAnswerProps {
  answer: string;
  citations: Citation[];
  isLoading?: boolean;
  onCitationClick?: (citationId: string) => void;
}

// Map superscript characters to numbers
const superscriptToNumber: Record<string, number> = {
  "¹": 1, "²": 2, "³": 3, "⁴": 4, "⁵": 5, 
  "⁶": 6, "⁷": 7, "⁸": 8, "⁹": 9, "⁰": 0,
};

// Get icon based on content keywords
const getContentIcon = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes("key") || lower.includes("important") || lower.includes("main")) 
    return <Target className="h-4 w-4 text-amber-500" />;
  if (lower.includes("tip") || lower.includes("hint") || lower.includes("suggestion")) 
    return <Lightbulb className="h-4 w-4 text-yellow-500" />;
  if (lower.includes("benefit") || lower.includes("advantage") || lower.includes("positive")) 
    return <Star className="h-4 w-4 text-emerald-500" />;
  if (lower.includes("trend") || lower.includes("growth") || lower.includes("increase")) 
    return <TrendingUp className="h-4 w-4 text-blue-500" />;
  if (lower.includes("warning") || lower.includes("caution") || lower.includes("risk")) 
    return <AlertCircle className="h-4 w-4 text-destructive" />;
  if (lower.includes("success") || lower.includes("complete") || lower.includes("achieve")) 
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (lower.includes("fast") || lower.includes("quick") || lower.includes("speed")) 
    return <Zap className="h-4 w-4 text-amber-500" />;
  if (lower.includes("learn") || lower.includes("study") || lower.includes("education")) 
    return <BookOpen className="h-4 w-4 text-purple-500" />;
  if (lower.includes("think") || lower.includes("idea") || lower.includes("concept")) 
    return <Brain className="h-4 w-4 text-pink-500" />;
  if (lower.includes("launch") || lower.includes("start") || lower.includes("begin")) 
    return <Rocket className="h-4 w-4 text-primary" />;
  if (lower.includes("love") || lower.includes("care") || lower.includes("health")) 
    return <Heart className="h-4 w-4 text-red-500" />;
  if (lower.includes("secure") || lower.includes("safe") || lower.includes("protect")) 
    return <Shield className="h-4 w-4 text-emerald-500" />;
  if (lower.includes("time") || lower.includes("deadline") || lower.includes("schedule")) 
    return <Clock className="h-4 w-4 text-blue-500" />;
  if (lower.includes("best") || lower.includes("top") || lower.includes("excellent")) 
    return <Award className="h-4 w-4 text-amber-500" />;
  return <ArrowRight className="h-4 w-4 text-muted-foreground" />;
};

export const FormattedAnswer = ({ 
  answer, 
  citations, 
  isLoading,
  onCitationClick
}: FormattedAnswerProps) => {
  
  const renderFormattedContent = useMemo(() => {
    const elements: JSX.Element[] = [];
    let key = 0;

    // Split by lines first to handle paragraphs
    const lines = answer.split('\n');
    
    lines.forEach((line, lineIndex) => {
      if (!line.trim()) {
        elements.push(<br key={key++} />);
        return;
      }

      // Check if it's a header (starts with # or **)
      const headerMatch = line.match(/^(#{1,3})\s*(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        const HeadingTag = `h${level + 1}` as keyof JSX.IntrinsicElements;
        elements.push(
          <HeadingTag 
            key={key++} 
            className={`flex items-center gap-2 font-bold text-foreground mt-4 mb-2 ${
              level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-base'
            }`}
          >
            {getContentIcon(text)}
            {processInlineFormatting(text, citations, key, onCitationClick)}
          </HeadingTag>
        );
        return;
      }

      // Check for bullet points
      const bulletMatch = line.match(/^[\s]*[-•*]\s*(.+)$/);
      if (bulletMatch) {
        const content = bulletMatch[1];
        elements.push(
          <div key={key++} className="flex items-start gap-3 my-2 ml-2">
            <span className="flex-shrink-0 mt-1.5">
              {getContentIcon(content)}
            </span>
            <span className="text-foreground">
              {processInlineFormatting(content, citations, key, onCitationClick)}
            </span>
          </div>
        );
        return;
      }

      // Check for numbered lists
      const numberedMatch = line.match(/^[\s]*(\d+)[.)]\s*(.+)$/);
      if (numberedMatch) {
        const num = numberedMatch[1];
        const content = numberedMatch[2];
        elements.push(
          <div key={key++} className="flex items-start gap-3 my-2 ml-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-bold flex items-center justify-center">
              {num}
            </span>
            <span className="text-foreground flex-1">
              {processInlineFormatting(content, citations, key, onCitationClick)}
            </span>
          </div>
        );
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={key++} className="text-foreground my-2 leading-relaxed">
          {processInlineFormatting(line, citations, key, onCitationClick)}
        </p>
      );
    });

    return elements;
  }, [answer, citations, onCitationClick]);

  return (
    <div className="space-y-1">
      {renderFormattedContent}
      {isLoading && (
        <span className="inline-flex items-center gap-1 text-primary">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
        </span>
      )}
    </div>
  );
};

// Process inline formatting (bold, italic, citations, code, highlights)
function processInlineFormatting(
  text: string, 
  citations: Citation[], 
  baseKey: number,
  onCitationClick?: (citationId: string) => void
): (string | JSX.Element)[] {
  const elements: (string | JSX.Element)[] = [];
  let currentText = "";
  let key = baseKey * 1000;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    // Check for superscript citation
    if (superscriptToNumber[char] !== undefined) {
      if (currentText) {
        elements.push(currentText);
        currentText = "";
      }
      const citationId = superscriptToNumber[char];
      const citation = citations.find(c => c.id === citationId);
      if (citation) {
        elements.push(<EnhancedCitationTooltip key={key++} citation={citation} onPreviewClick={onCitationClick} />);
      } else {
        elements.push(
          <sup key={key++} className="inline-flex items-center justify-center w-4 h-4 text-[9px] font-medium rounded-full bg-muted text-muted-foreground ml-0.5">
            {citationId}
          </sup>
        );
      }
      i++;
      continue;
    }

    // Check for bracketed citation [1], [2], etc.
    if (char === "[" && i + 2 < text.length) {
      const closeIndex = text.indexOf("]", i);
      if (closeIndex !== -1 && closeIndex - i <= 3) {
        const numStr = text.slice(i + 1, closeIndex);
        const citationId = parseInt(numStr, 10);
        if (!isNaN(citationId)) {
          if (currentText) {
            elements.push(currentText);
            currentText = "";
          }
          const citation = citations.find(c => c.id === citationId);
          if (citation) {
            elements.push(<EnhancedCitationTooltip key={key++} citation={citation} onPreviewClick={onCitationClick} />);
          } else {
            elements.push(
              <sup key={key++} className="inline-flex items-center justify-center w-4 h-4 text-[9px] font-medium rounded-full bg-muted text-muted-foreground ml-0.5">
                {citationId}
              </sup>
            );
          }
          i = closeIndex + 1;
          continue;
        }
      }
    }

    // Check for ***bold italic*** or ___bold italic___
    if ((char === "*" || char === "_") && text.slice(i, i + 3) === char.repeat(3)) {
      const closeIndex = text.indexOf(char.repeat(3), i + 3);
      if (closeIndex !== -1) {
        if (currentText) {
          elements.push(currentText);
          currentText = "";
        }
        const content = text.slice(i + 3, closeIndex);
        elements.push(
          <span 
            key={key++} 
            className="font-bold italic bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            {content}
          </span>
        );
        i = closeIndex + 3;
        continue;
      }
    }

    // Check for **bold**
    if (char === "*" && text[i + 1] === "*") {
      const closeIndex = text.indexOf("**", i + 2);
      if (closeIndex !== -1) {
        if (currentText) {
          elements.push(currentText);
          currentText = "";
        }
        const content = text.slice(i + 2, closeIndex);
        elements.push(
          <strong key={key++} className="font-bold text-primary">
            {content}
          </strong>
        );
        i = closeIndex + 2;
        continue;
      }
    }

    // Check for *italic* or _italic_
    if ((char === "*" || char === "_") && text[i - 1] !== char && text[i + 1] !== char) {
      const closeIndex = text.indexOf(char, i + 1);
      if (closeIndex !== -1 && closeIndex > i + 1) {
        if (currentText) {
          elements.push(currentText);
          currentText = "";
        }
        const content = text.slice(i + 1, closeIndex);
        elements.push(
          <em key={key++} className="italic text-amber-500 dark:text-amber-400">
            {content}
          </em>
        );
        i = closeIndex + 1;
        continue;
      }
    }

    // Check for `inline code`
    if (char === "`" && text[i + 1] !== "`") {
      const closeIndex = text.indexOf("`", i + 1);
      if (closeIndex !== -1) {
        if (currentText) {
          elements.push(currentText);
          currentText = "";
        }
        const content = text.slice(i + 1, closeIndex);
        elements.push(
          <code 
            key={key++} 
            className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-sm"
          >
            {content}
          </code>
        );
        i = closeIndex + 1;
        continue;
      }
    }

    // Check for ==highlight==
    if (char === "=" && text[i + 1] === "=") {
      const closeIndex = text.indexOf("==", i + 2);
      if (closeIndex !== -1) {
        if (currentText) {
          elements.push(currentText);
          currentText = "";
        }
        const content = text.slice(i + 2, closeIndex);
        elements.push(
          <mark 
            key={key++} 
            className="px-1 rounded bg-yellow-500/30 text-foreground"
          >
            {content}
          </mark>
        );
        i = closeIndex + 2;
        continue;
      }
    }

    currentText += char;
    i++;
  }

  if (currentText) {
    elements.push(currentText);
  }

  return elements;
}
