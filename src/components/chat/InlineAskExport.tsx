import { useState } from "react";
import { Download, FileText, FileJson, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { InlineAskData } from "./InlineAskComment";

interface InlineAskExportProps {
  inlineAsks: InlineAskData[];
  sessionTitle?: string;
}

export const InlineAskExport = ({ inlineAsks, sessionTitle = "Proxinex Ask Export" }: InlineAskExportProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleString();
  };

  const exportAsMarkdown = () => {
    setIsExporting(true);
    
    let markdown = `# ${sessionTitle}\n\n`;
    markdown += `*Exported on ${new Date().toLocaleString()}*\n\n`;
    markdown += `**Total Proxinex Asks:** ${inlineAsks.length}\n\n---\n\n`;

    inlineAsks.forEach((ask, index) => {
      markdown += `## ${index + 1}. Highlighted Text\n\n`;
      markdown += `> ${ask.selectedText}\n\n`;
      markdown += `**Question:** ${ask.question}\n\n`;
      markdown += `**Answer:** ${ask.answer}\n\n`;
      
      if (ask.conversationHistory && ask.conversationHistory.length > 0) {
        markdown += `### Follow-up Conversation\n\n`;
        ask.conversationHistory.forEach((msg) => {
          const role = msg.role === "user" ? "👤 You" : "🤖 Proxinex";
          markdown += `**${role}:** ${msg.content}\n\n`;
        });
      }
      
      if (ask.timestamp) {
        markdown += `*${formatDate(ask.timestamp)}*\n\n`;
      }
      
      if (index < inlineAsks.length - 1) {
        markdown += "---\n\n";
      }
    });

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sessionTitle.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExporting(false);
    toast.success("Proxinex Asks exported as Markdown!");
  };

  const exportAsPDF = async () => {
    setIsExporting(true);
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${sessionTitle}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: #fff; color: #333; }
          h1 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; font-size: 18px; }
          .metadata { color: #666; font-size: 14px; margin-bottom: 30px; }
          .ask-card { margin-bottom: 30px; padding: 20px; border-radius: 12px; background: #f9fafb; border: 1px solid #e5e7eb; }
          .highlighted-text { background: #fef9c3; padding: 12px; border-left: 4px solid #eab308; margin-bottom: 15px; font-style: italic; border-radius: 0 8px 8px 0; }
          .question { color: #6366f1; font-weight: 600; margin-bottom: 8px; }
          .answer { line-height: 1.6; margin-bottom: 15px; }
          .conversation { background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
          .conversation-msg { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
          .conversation-msg:last-child { border-bottom: none; }
          .role-user { color: #6366f1; font-weight: 500; }
          .role-assistant { color: #059669; font-weight: 500; }
          .timestamp { font-size: 12px; color: #9ca3af; margin-top: 10px; }
          hr { border: none; border-top: 1px solid #e5e7eb; margin: 25px 0; }
        </style>
      </head>
      <body>
        <h1>🎯 ${sessionTitle}</h1>
        <div class="metadata">
          Exported on ${new Date().toLocaleString()} • ${inlineAsks.length} Proxinex Asks
        </div>
    `;

    inlineAsks.forEach((ask, index) => {
      htmlContent += `
        <div class="ask-card">
          <h2>${index + 1}. Highlighted Text</h2>
          <div class="highlighted-text">"${ask.selectedText}"</div>
          <div class="question">❓ ${ask.question}</div>
          <div class="answer">${ask.answer}</div>
      `;
      
      if (ask.conversationHistory && ask.conversationHistory.length > 0) {
        htmlContent += `<div class="conversation"><strong>Follow-up Conversation:</strong>`;
        ask.conversationHistory.forEach((msg) => {
          const roleClass = msg.role === "user" ? "role-user" : "role-assistant";
          const roleLabel = msg.role === "user" ? "You" : "Proxinex";
          htmlContent += `<div class="conversation-msg"><span class="${roleClass}">${roleLabel}:</span> ${msg.content}</div>`;
        });
        htmlContent += `</div>`;
      }
      
      if (ask.timestamp) {
        htmlContent += `<div class="timestamp">${formatDate(ask.timestamp)}</div>`;
      }
      
      htmlContent += `</div>`;
    });

    htmlContent += `</body></html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      toast.success("PDF print dialog opened!");
    } else {
      toast.error("Please allow popups to export PDF");
    }

    setIsExporting(false);
  };

  const exportAsJSON = () => {
    setIsExporting(true);
    
    const jsonData = {
      title: sessionTitle,
      exportedAt: new Date().toISOString(),
      totalAsks: inlineAsks.length,
      asks: inlineAsks.map(ask => ({
        id: ask.id,
        selectedText: ask.selectedText,
        question: ask.question,
        answer: ask.answer,
        confidence: ask.confidence,
        timestamp: ask.timestamp ? new Date(ask.timestamp).toISOString() : null,
        conversationHistory: ask.conversationHistory?.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : null
        })) || []
      }))
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sessionTitle.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExporting(false);
    toast.success("Proxinex Asks exported as JSON!");
  };

  if (inlineAsks.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export Asks
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsPDF}>
          <FileText className="h-4 w-4 mr-2 text-red-500" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsMarkdown}>
          <FileText className="h-4 w-4 mr-2 text-blue-500" />
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON}>
          <FileJson className="h-4 w-4 mr-2 text-green-500" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
