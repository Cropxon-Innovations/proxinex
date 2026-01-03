import { useState } from "react";
import { Download, FileText, FileJson, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface ChatExportProps {
  messages: Message[];
  sessionTitle?: string;
}

export const ChatExport = ({ messages, sessionTitle = "Chat Export" }: ChatExportProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleString();
  };

  const exportAsMarkdown = () => {
    setIsExporting(true);
    
    let markdown = `# ${sessionTitle}\n\n`;
    markdown += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;

    messages.forEach((msg, index) => {
      const role = msg.role === "user" ? "👤 You" : "🤖 Proxinex";
      const timestamp = msg.timestamp ? ` *(${formatDate(msg.timestamp)})*` : "";
      
      markdown += `### ${role}${timestamp}\n\n`;
      markdown += `${msg.content}\n\n`;
      
      if (index < messages.length - 1) {
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
    toast.success("Chat exported as Markdown!");
  };

  const exportAsPDF = async () => {
    setIsExporting(true);
    
    // Create HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${sessionTitle}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: #fff; color: #333; }
          h1 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
          .metadata { color: #666; font-size: 14px; margin-bottom: 30px; }
          .message { margin-bottom: 25px; padding: 15px; border-radius: 12px; }
          .user { background: #6366f1; color: white; margin-left: 50px; }
          .assistant { background: #f3f4f6; border: 1px solid #e5e7eb; margin-right: 50px; }
          .role { font-weight: bold; font-size: 14px; margin-bottom: 8px; opacity: 0.8; }
          .timestamp { font-size: 11px; opacity: 0.6; margin-top: 8px; }
          .content { white-space: pre-wrap; line-height: 1.6; }
          code { background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 4px; font-family: 'Consolas', monospace; font-size: 13px; }
          pre { background: #1e1e2e; color: #f8f8f2; padding: 15px; border-radius: 8px; overflow-x: auto; }
          pre code { background: none; padding: 0; }
          hr { border: none; border-top: 1px solid #e5e7eb; margin: 30px 0; }
        </style>
      </head>
      <body>
        <h1>📋 ${sessionTitle}</h1>
        <div class="metadata">Exported on ${new Date().toLocaleString()} • ${messages.length} messages</div>
    `;

    messages.forEach((msg) => {
      const roleClass = msg.role === "user" ? "user" : "assistant";
      const roleLabel = msg.role === "user" ? "👤 You" : "🤖 Proxinex";
      const timestamp = msg.timestamp ? `<div class="timestamp">${formatDate(msg.timestamp)}</div>` : "";
      
      // Simple markdown to HTML conversion
      let content = msg.content
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
      
      htmlContent += `
        <div class="message ${roleClass}">
          <div class="role">${roleLabel}</div>
          <div class="content">${content}</div>
          ${timestamp}
        </div>
      `;
    });

    htmlContent += `
      </body>
      </html>
    `;

    // Open print dialog for PDF
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
      messageCount: messages.length,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : null
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
    toast.success("Chat exported as JSON!");
  };

  if (messages.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export
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
