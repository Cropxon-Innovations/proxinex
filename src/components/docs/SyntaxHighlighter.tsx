import React from "react";
import { 
  Code, 
  Hash, 
  Type, 
  Braces, 
  Quote, 
  MessageSquare,
  Sparkles,
  Variable,
  FunctionSquare
} from "lucide-react";

interface TokenStyle {
  color: string;
  className: string;
}

const tokenStyles: Record<string, TokenStyle> = {
  keyword: { color: "hsl(var(--primary))", className: "text-primary font-medium" },
  string: { color: "hsl(120, 50%, 60%)", className: "text-emerald-400" },
  number: { color: "hsl(35, 90%, 60%)", className: "text-amber-400" },
  comment: { color: "hsl(var(--muted-foreground))", className: "text-muted-foreground italic" },
  function: { color: "hsl(280, 80%, 70%)", className: "text-purple-400" },
  variable: { color: "hsl(200, 80%, 70%)", className: "text-sky-400" },
  property: { color: "hsl(350, 80%, 70%)", className: "text-rose-400" },
  operator: { color: "hsl(var(--foreground))", className: "text-foreground" },
  bracket: { color: "hsl(45, 80%, 60%)", className: "text-yellow-400" },
  type: { color: "hsl(170, 70%, 60%)", className: "text-teal-400" },
  decorator: { color: "hsl(35, 90%, 60%)", className: "text-amber-400" },
  constant: { color: "hsl(200, 90%, 70%)", className: "text-blue-400" },
};

const pythonKeywords = [
  "from", "import", "def", "class", "return", "if", "else", "elif", "for", 
  "while", "try", "except", "finally", "with", "as", "pass", "break", "continue",
  "and", "or", "not", "in", "is", "None", "True", "False", "async", "await", "print"
];

const jsKeywords = [
  "import", "from", "export", "default", "const", "let", "var", "function", "async",
  "await", "return", "if", "else", "for", "while", "try", "catch", "finally", "throw",
  "new", "class", "extends", "this", "super", "static", "null", "undefined", "true", 
  "false", "typeof", "instanceof", "console"
];

const curlKeywords = [
  "curl", "GET", "POST", "PUT", "DELETE", "PATCH", "Response"
];

const csharpKeywords = [
  "using", "namespace", "class", "public", "private", "protected", "static", "void",
  "async", "await", "return", "if", "else", "for", "foreach", "while", "try", "catch",
  "finally", "throw", "new", "var", "string", "int", "bool", "Console", "true", "false", "null"
];

interface SyntaxHighlighterProps {
  code: string;
  language: "python" | "javascript" | "curl" | "dotnet";
}

const getKeywords = (language: string): string[] => {
  switch (language) {
    case "python": return pythonKeywords;
    case "javascript": return jsKeywords;
    case "curl": return curlKeywords;
    case "dotnet": return csharpKeywords;
    default: return [];
  }
};

const tokenizeLine = (line: string, language: string): React.ReactNode[] => {
  const keywords = getKeywords(language);
  const tokens: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  while (remaining.length > 0) {
    // Check for comments
    const commentMatch = remaining.match(/^(#.*|\/\/.*|\/\*[\s\S]*?\*\/)/);
    if (commentMatch) {
      tokens.push(
        <span key={key++} className={tokenStyles.comment.className}>
          <MessageSquare className="inline h-3 w-3 mr-1 opacity-50" />
          {commentMatch[0]}
        </span>
      );
      remaining = remaining.slice(commentMatch[0].length);
      continue;
    }

    // Check for strings (double quotes)
    const doubleStringMatch = remaining.match(/^"([^"\\]|\\.)*"/);
    if (doubleStringMatch) {
      tokens.push(
        <span key={key++} className={tokenStyles.string.className}>
          {doubleStringMatch[0]}
        </span>
      );
      remaining = remaining.slice(doubleStringMatch[0].length);
      continue;
    }

    // Check for strings (single quotes)
    const singleStringMatch = remaining.match(/^'([^'\\]|\\.)*'/);
    if (singleStringMatch) {
      tokens.push(
        <span key={key++} className={tokenStyles.string.className}>
          {singleStringMatch[0]}
        </span>
      );
      remaining = remaining.slice(singleStringMatch[0].length);
      continue;
    }

    // Check for template strings
    const templateMatch = remaining.match(/^`([^`\\]|\\.)*`/);
    if (templateMatch) {
      tokens.push(
        <span key={key++} className={tokenStyles.string.className}>
          {templateMatch[0]}
        </span>
      );
      remaining = remaining.slice(templateMatch[0].length);
      continue;
    }

    // Check for numbers
    const numberMatch = remaining.match(/^-?\d+(\.\d+)?/);
    if (numberMatch) {
      tokens.push(
        <span key={key++} className={tokenStyles.number.className}>
          {numberMatch[0]}
        </span>
      );
      remaining = remaining.slice(numberMatch[0].length);
      continue;
    }

    // Check for decorators (@)
    const decoratorMatch = remaining.match(/^@\w+/);
    if (decoratorMatch) {
      tokens.push(
        <span key={key++} className={tokenStyles.decorator.className}>
          <Sparkles className="inline h-3 w-3 mr-0.5" />
          {decoratorMatch[0]}
        </span>
      );
      remaining = remaining.slice(decoratorMatch[0].length);
      continue;
    }

    // Check for function calls
    const funcMatch = remaining.match(/^(\w+)\s*\(/);
    if (funcMatch) {
      const funcName = funcMatch[1];
      if (keywords.includes(funcName)) {
        tokens.push(
          <span key={key++} className={tokenStyles.keyword.className}>
            {funcName}
          </span>
        );
      } else {
        tokens.push(
          <span key={key++} className={tokenStyles.function.className}>
            {funcName}
          </span>
        );
      }
      remaining = remaining.slice(funcName.length);
      continue;
    }

    // Check for property access (.property)
    const propertyMatch = remaining.match(/^\.(\w+)/);
    if (propertyMatch) {
      tokens.push(
        <span key={key++} className="text-foreground">.</span>
      );
      tokens.push(
        <span key={key++} className={tokenStyles.property.className}>
          {propertyMatch[1]}
        </span>
      );
      remaining = remaining.slice(propertyMatch[0].length);
      continue;
    }

    // Check for keywords and identifiers
    const wordMatch = remaining.match(/^[a-zA-Z_]\w*/);
    if (wordMatch) {
      const word = wordMatch[0];
      if (keywords.includes(word)) {
        tokens.push(
          <span key={key++} className={tokenStyles.keyword.className}>
            {word}
          </span>
        );
      } else if (word.match(/^[A-Z][a-zA-Z0-9]*$/)) {
        // Type or class name (PascalCase)
        tokens.push(
          <span key={key++} className={tokenStyles.type.className}>
            {word}
          </span>
        );
      } else if (word === word.toUpperCase() && word.length > 1) {
        // Constants (ALL_CAPS)
        tokens.push(
          <span key={key++} className={tokenStyles.constant.className}>
            {word}
          </span>
        );
      } else {
        tokens.push(
          <span key={key++} className={tokenStyles.variable.className}>
            {word}
          </span>
        );
      }
      remaining = remaining.slice(word.length);
      continue;
    }

    // Check for brackets and braces
    const bracketMatch = remaining.match(/^[\[\]\{\}\(\)]/);
    if (bracketMatch) {
      tokens.push(
        <span key={key++} className={tokenStyles.bracket.className}>
          {bracketMatch[0]}
        </span>
      );
      remaining = remaining.slice(1);
      continue;
    }

    // Check for operators
    const operatorMatch = remaining.match(/^[=+\-*/%<>!&|^~:;,\\]+/);
    if (operatorMatch) {
      tokens.push(
        <span key={key++} className={tokenStyles.operator.className}>
          {operatorMatch[0]}
        </span>
      );
      remaining = remaining.slice(operatorMatch[0].length);
      continue;
    }

    // Default: single character
    tokens.push(
      <span key={key++} className="text-foreground">
        {remaining[0]}
      </span>
    );
    remaining = remaining.slice(1);
  }

  return tokens;
};

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({ code, language }) => {
  const lines = code.split("\n");

  return (
    <div className="font-mono text-sm leading-relaxed">
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} className="flex">
          <span className="text-muted-foreground/50 select-none w-8 text-right pr-4 flex-shrink-0">
            {lineIndex + 1}
          </span>
          <span className="flex-1 whitespace-pre-wrap break-all">
            {tokenizeLine(line, language)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SyntaxHighlighter;
