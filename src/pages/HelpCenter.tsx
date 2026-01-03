import { useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Layers, 
  BookOpen, 
  FileText, 
  Image, 
  Video, 
  Code,
  BarChart3,
  Key,
  Settings,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Book,
  PlayCircle,
  Mail,
  MessageCircle,
  ChevronDown,
  ExternalLink,
  Send,
  Brain
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sidebarItems = [
  { icon: Plus, label: "New Session", path: "/app", isNew: true },
  { icon: MessageSquare, label: "Chat", path: "/app/chat" },
  { icon: Search, label: "Research", path: "/app/research" },
  { icon: Brain, label: "Memory", path: "/app/memory" },
  { icon: Layers, label: "Sandbox", path: "/app/sandbox" },
  { icon: BookOpen, label: "Notebooks", path: "/app/notebooks" },
  { icon: FileText, label: "Documents", path: "/app/documents" },
  { icon: Image, label: "Images", path: "/app/images" },
  { icon: Video, label: "Video", path: "/app/video" },
  { icon: Code, label: "API Playground", path: "/app/api" },
  { divider: true },
  { icon: BarChart3, label: "Usage & Cost", path: "/app/usage" },
  { icon: Key, label: "API Keys", path: "/app/api-keys" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
];

const faqs = [
  {
    category: "Getting Started",
    items: [
      {
        question: "What is Proxinex?",
        answer: "Proxinex is an AI control plane that intelligently routes tasks to the most suitable models, balancing cost, accuracy, and confidence. It provides project-based AI memory, verified knowledge storage, and multi-model intelligence."
      },
      {
        question: "How do I start a new research project?",
        answer: "Click 'New Session' in the sidebar, then select 'Research' mode. You can ask questions, and Proxinex will search multiple sources, verify information, and store confirmed facts in your project memory."
      },
      {
        question: "What models does Proxinex support?",
        answer: "Proxinex supports both open-source and closed-source models including GPT-4, Claude, Gemini, Llama 3, Mistral, and more. In Auto mode, we intelligently route to the best model for your task."
      }
    ]
  },
  {
    category: "Memory & Projects",
    items: [
      {
        question: "How does project memory work?",
        answer: "Proxinex remembers verified knowledge and decisions within each project — not every message. Only high-confidence (≥75%), verified facts are stored. You can view, edit, or clear what Proxinex remembers at any time."
      },
      {
        question: "Can I export my project memory?",
        answer: "Yes! Go to Memory → Export and choose Markdown or PDF format. This includes your project goal, confirmed facts, trusted sources, and all memory items."
      },
      {
        question: "What gets stored vs. not stored?",
        answer: "Stored: Verified facts, important decisions, summaries with high confidence. Not stored: Draft rewrites, casual chat, explanations, low-confidence outputs."
      }
    ]
  },
  {
    category: "Billing & Plans",
    items: [
      {
        question: "How does pricing work?",
        answer: "We offer Free, Pro, and Enterprise plans. Free includes limited queries per day. Pro unlocks unlimited queries, priority models, and advanced features. Enterprise offers custom solutions."
      },
      {
        question: "What counts as a query?",
        answer: "Each message you send counts as one query. Follow-up questions within the same conversation context may use fewer tokens and cost less."
      },
      {
        question: "Can I set spending limits?",
        answer: "Yes! Go to Settings → Usage & Billing → Set Limits. You can set daily, weekly, or monthly caps."
      }
    ]
  },
  {
    category: "Integrations",
    items: [
      {
        question: "How do I connect external apps?",
        answer: "Go to Settings → Apps & Connectors. Click on any app to connect it. Once connected, you can use @mention in chat to interact with that app."
      },
      {
        question: "What integrations are available?",
        answer: "We support Notion, Slack, Google Drive, GitHub, Linear, Figma, and more. New integrations are added regularly."
      },
      {
        question: "Can I use the API?",
        answer: "Yes! Go to API Keys to generate your key. Full API documentation is available in the Docs section."
      }
    ]
  }
];

const tutorials = [
  {
    title: "Getting Started with Proxinex",
    duration: "5 min",
    thumbnail: "🚀",
    description: "Learn the basics of using Proxinex for AI-powered research"
  },
  {
    title: "Managing Project Memory",
    duration: "8 min",
    thumbnail: "🧠",
    description: "How to use project memory for better research outcomes"
  },
  {
    title: "Multi-Model Intelligence",
    duration: "6 min",
    thumbnail: "🤖",
    description: "Understanding how Proxinex routes to different AI models"
  },
  {
    title: "Connecting Integrations",
    duration: "4 min",
    thumbnail: "🔗",
    description: "Set up Notion, Slack, and other app integrations"
  },
  {
    title: "Using the API",
    duration: "10 min",
    thumbnail: "⚡",
    description: "Integrate Proxinex into your own applications"
  },
  {
    title: "Advanced Research Techniques",
    duration: "12 min",
    thumbnail: "🔬",
    description: "Power user tips for effective research workflows"
  }
];

const HelpCenterPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { toast } = useToast();

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketPriority, setTicketPriority] = useState("medium");

  const handleSubmitTicket = () => {
    if (!ticketSubject || !ticketMessage) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    // In real app, submit to backend
    toast({ title: "Ticket Submitted", description: "We'll respond within 24 hours" });
    setTicketSubject("");
    setTicketMessage("");
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <>
      <Helmet>
        <title>Help Center - Proxinex</title>
        <meta name="description" content="Get help with Proxinex. FAQ, tutorials, and support." />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} border-r border-border bg-sidebar flex flex-col transition-all duration-300 flex-shrink-0`}>
          <div className="h-16 border-b border-sidebar-border flex items-center px-4">
            <Link to="/"><Logo size="sm" showText={!sidebarCollapsed} /></Link>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            {sidebarItems.map((item, index) => {
              if ('divider' in item && item.divider) return <div key={index} className="my-4 border-t border-sidebar-border" />;
              const Icon = item.icon!;
              return (
                <Link key={item.path} to={item.path!} className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="h-12 border-t border-sidebar-border flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/50">
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Help Center</h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Find answers, watch tutorials, and get support for Proxinex
              </p>
              
              {/* Search */}
              <div className="max-w-xl mx-auto mt-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for help..."
                    className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/docs" className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group">
                <Book className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-foreground mb-1">Documentation</h3>
                <p className="text-sm text-muted-foreground">Complete guides and API reference</p>
              </Link>
              <button onClick={() => document.getElementById('tutorials')?.scrollIntoView({ behavior: 'smooth' })} className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group text-left">
                <PlayCircle className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-foreground mb-1">Video Tutorials</h3>
                <p className="text-sm text-muted-foreground">Step-by-step video guides</p>
              </button>
              <button onClick={() => document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' })} className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group text-left">
                <Mail className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-foreground mb-1">Contact Support</h3>
                <p className="text-sm text-muted-foreground">Create a support ticket</p>
              </button>
            </div>

            {/* FAQ Section */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground text-lg">Frequently Asked Questions</h2>
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No matching questions found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredFaqs.map((category) => (
                    <div key={category.category}>
                      <h3 className="text-sm font-medium text-primary mb-3">{category.category}</h3>
                      <Accordion type="single" collapsible className="space-y-2">
                        {category.items.map((item, index) => (
                          <AccordionItem
                            key={index}
                            value={`${category.category}-${index}`}
                            className="border border-border rounded-lg px-4"
                          >
                            <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-3">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground pb-3">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tutorials Section */}
            <div id="tutorials" className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <PlayCircle className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground text-lg">Video Tutorials</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutorials.map((tutorial, index) => (
                  <button
                    key={index}
                    className="bg-secondary/30 border border-border rounded-xl p-4 hover:border-primary/50 transition-colors text-left group"
                  >
                    <div className="h-24 bg-background rounded-lg flex items-center justify-center text-4xl mb-3 group-hover:scale-105 transition-transform">
                      {tutorial.thumbnail}
                    </div>
                    <h4 className="font-medium text-foreground text-sm mb-1">{tutorial.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{tutorial.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      {tutorial.duration}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Support Ticket Section */}
            <div id="support" className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground text-lg">Contact Support</h2>
              </div>

              <div className="max-w-2xl">
                <p className="text-sm text-muted-foreground mb-6">
                  Can't find what you're looking for? Submit a support ticket and we'll get back to you within 24 hours.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Subject</label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Priority</label>
                    <div className="flex gap-3">
                      {["low", "medium", "high"].map((priority) => (
                        <button
                          key={priority}
                          onClick={() => setTicketPriority(priority)}
                          className={`px-4 py-2 rounded-lg border text-sm capitalize transition-colors ${
                            ticketPriority === priority
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-foreground hover:border-primary/50'
                          }`}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Message</label>
                    <textarea
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Describe your issue in detail..."
                      className="w-full h-32 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <Button onClick={handleSubmitTicket} className="bg-primary text-primary-foreground">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Ticket
                  </Button>
                </div>
              </div>
            </div>

            {/* Still need help */}
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Still need help?</p>
              <div className="flex items-center justify-center gap-4">
                <a href="mailto:support@proxinex.ai" className="text-primary hover:underline flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  support@proxinex.ai
                </a>
                <span className="text-border">|</span>
                <a href="#" className="text-primary hover:underline flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Live Chat
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default HelpCenterPage;
