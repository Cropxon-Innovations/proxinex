import { Link } from "react-router-dom";
import { Logo } from "./Logo";

const footerLinks = {
  Product: [
    { label: "Overview", href: "/product" },
    { label: "How It Works", href: "/product/how-it-works" },
    { label: "Sandbox", href: "/sandbox" },
    { label: "Inline Ask™", href: "/product/inline-ask" },
    { label: "Pricing", href: "/pricing" },
  ],
  Developers: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/docs" },
    { label: "For Developers", href: "/product/developers" },
    { label: "Enterprise", href: "/product/enterprise" },
  ],
  Company: [
    { label: "About", href: "/product" },
    { label: "Security", href: "/security" },
    { label: "Trust & Accuracy", href: "/product/trust" },
    { label: "Help Center", href: "/help" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund" },
    { label: "Data Policy", href: "/data-policy" },
    { label: "GDPR", href: "/gdpr" },
  ],
};

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo size="sm" />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              The AI Intelligence Control Plane. Control your AI with trust, accuracy, and cost transparency.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-medium text-foreground mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}{" "}
            <a
              href="https://www.cropxon.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              CROPXON INNOVATIONS PVT LTD
            </a>
            . All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Made with precision in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
