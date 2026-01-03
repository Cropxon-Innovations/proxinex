import { Fragment } from "react";
import { CitationTooltip, Citation } from "./CitationTooltip";

interface AnswerWithCitationsProps {
  answer: string;
  citations: Citation[];
  isLoading?: boolean;
}

// Map superscript characters to numbers
const superscriptToNumber: Record<string, number> = {
  "¹": 1, "²": 2, "³": 3, "⁴": 4, "⁵": 5, 
  "⁶": 6, "⁷": 7, "⁸": 8, "⁹": 9, "⁰": 0,
};

export const AnswerWithCitations = ({ 
  answer, 
  citations, 
  isLoading 
}: AnswerWithCitationsProps) => {
  // Parse answer and replace citation markers with tooltip components
  const renderContent = () => {
    const elements: (string | JSX.Element)[] = [];
    let currentText = "";
    let key = 0;

    for (let i = 0; i < answer.length; i++) {
      const char = answer[i];
      
      // Check for superscript citation
      if (superscriptToNumber[char] !== undefined) {
        // Flush current text
        if (currentText) {
          elements.push(currentText);
          currentText = "";
        }
        
        const citationId = superscriptToNumber[char];
        const citation = citations.find(c => c.id === citationId);
        
        if (citation) {
          elements.push(
            <CitationTooltip key={key++} citation={citation} />
          );
        } else {
          // Show as plain superscript if no matching citation
          elements.push(
            <sup key={key++} className="text-muted-foreground">{citationId}</sup>
          );
        }
        continue;
      }
      
      // Check for bracketed citation format [1], [2], etc.
      if (char === "[" && i + 2 < answer.length) {
        const closeIndex = answer.indexOf("]", i);
        if (closeIndex !== -1 && closeIndex - i <= 3) {
          const numStr = answer.slice(i + 1, closeIndex);
          const citationId = parseInt(numStr, 10);
          
          if (!isNaN(citationId)) {
            // Flush current text
            if (currentText) {
              elements.push(currentText);
              currentText = "";
            }
            
            const citation = citations.find(c => c.id === citationId);
            
            if (citation) {
              elements.push(
                <CitationTooltip key={key++} citation={citation} />
              );
            } else {
              elements.push(
                <sup key={key++} className="text-muted-foreground">[{citationId}]</sup>
              );
            }
            
            i = closeIndex; // Skip past the closing bracket
            continue;
          }
        }
      }
      
      currentText += char;
    }
    
    // Flush remaining text
    if (currentText) {
      elements.push(currentText);
    }
    
    return elements;
  };

  return (
    <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
      {renderContent()}
      {isLoading && (
        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
      )}
    </p>
  );
};
