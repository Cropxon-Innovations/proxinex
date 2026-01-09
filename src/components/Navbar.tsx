import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { 
  Menu, 
  X, 
  ChevronDown, 
  Layers, 
  Workflow, 
  FlaskConical, 
  MessageSquareText, 
  ShieldCheck, 
  Code2, 
  Building2,
  DollarSign,
  BookOpen,
  GitCompare,
  Sparkles,
  LogIn,
  Rocket
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";

const productLinks = [
  { label: "Overview", href: "/product", icon: Layers, description: "Platform overview" },
  { label: "How It Works", href: "/product/how-it-works", icon: Workflow, description: "AI routing explained" },
  { label: "Sandbox", href: "/sandbox", icon: FlaskConical, description: "Compare AI models" },
  { label: "Inline Ask™", href: "/product/inline-ask", icon: MessageSquareText, description: "Context-aware AI" },
  { label: "Trust & Accuracy", href: "/product/trust", icon: ShieldCheck, description: "Verified responses" },
];

const developerLinks = [
  { label: "For Developers", href: "/product/developers", icon: Code2, description: "API & integrations" },
  { label: "For Enterprises", href: "/product/enterprise", icon: Building2, description: "Enterprise solutions" },
];

const navLinks = [
  { label: "Sandbox", href: "/sandbox", icon: FlaskConical },
  { label: "Pricing", href: "/pricing", icon: DollarSign },
  { label: "Docs", href: "/docs", icon: BookOpen },
  { label: "Compare", href: "/compare", icon: GitCompare },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <Logo size="sm" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {/* Product Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
                <Sparkles className="h-4 w-4" />
                Product
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-2 bg-popover border-border">
              {productLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild className="p-0">
                  <Link 
                    to={link.href}
                    className="flex items-start gap-3 px-3 py-2.5 cursor-pointer rounded-md hover:bg-secondary/80 w-full"
                  >
                    <link.icon className="h-4 w-4 mt-0.5 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{link.label}</span>
                      <span className="text-xs text-muted-foreground">{link.description}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="my-2" />
              {developerLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild className="p-0">
                  <Link 
                    to={link.href}
                    className="flex items-start gap-3 px-3 py-2.5 cursor-pointer rounded-md hover:bg-secondary/80 w-full"
                  >
                    <link.icon className="h-4 w-4 mt-0.5 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{link.label}</span>
                      <span className="text-xs text-muted-foreground">{link.description}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm transition-colors rounded-lg ${
                isActive(link.href)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 glow gap-1.5">
              <Rocket className="h-4 w-4" />
              Try Proxinex Free
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {/* Product Section */}
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
              Product
            </div>
            {productLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="h-4 w-4 text-primary" />
                {link.label}
              </Link>
            ))}

            <div className="border-t border-border my-3" />

            {/* Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm rounded-lg ${
                  isActive(link.href) 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}

            <div className="border-t border-border my-3" />

            {/* Auth Actions */}
            <div className="pt-2 space-y-2">
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center bg-primary text-primary-foreground gap-2">
                  <Rocket className="h-4 w-4" />
                  Try Proxinex Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
