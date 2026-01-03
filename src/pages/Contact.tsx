import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  MessageSquare, 
  Building, 
  HelpCircle,
  Send,
  MapPin,
  Clock
} from "lucide-react";
import { toast } from "sonner";

const contactOptions = [
  {
    icon: HelpCircle,
    title: "Support",
    description: "Get help with your Proxinex account or technical issues.",
    action: "Visit Help Center",
    href: "/help"
  },
  {
    icon: Building,
    title: "Enterprise",
    description: "Learn about enterprise pricing and custom solutions.",
    action: "Contact Sales",
    href: "/product/enterprise"
  },
  {
    icon: MessageSquare,
    title: "Partnerships",
    description: "Interested in partnering with Proxinex? Let's talk.",
    action: "Partner With Us",
    href: "#contact-form"
  }
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", company: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <Helmet>
        <title>Contact Proxinex - Get in Touch</title>
        <meta 
          name="description" 
          content="Contact the Proxinex team for support, enterprise inquiries, or partnership opportunities. We're here to help." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24">
          {/* Hero Section */}
          <section className="py-16 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Get in Touch
                </h1>
                <p className="text-xl text-muted-foreground">
                  Have questions? We'd love to hear from you.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Options */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-3 gap-6">
                  {contactOptions.map((option, index) => (
                    <a 
                      key={option.title}
                      href={option.href}
                      className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all animate-fade-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <option.icon className="h-10 w-10 text-primary mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {option.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {option.description}
                      </p>
                      <span className="text-sm text-primary font-medium">
                        {option.action} →
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Contact Form Section */}
          <section id="contact-form" className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12">
                  {/* Form */}
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      Send Us a Message
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Fill out the form below and we'll get back to you within 24 hours.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="company">Company (optional)</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Your company"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="How can we help?"
                          required
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us more..."
                          rows={5}
                          required
                          className="mt-1"
                        />
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </div>

                  {/* Company Info */}
                  <div className="space-y-8">
                    <div className="p-6 rounded-xl bg-card border border-border">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Company Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Building className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <div className="font-medium text-foreground">CROPXON INNOVATIONS PVT LTD</div>
                            <div className="text-sm text-muted-foreground">Parent Company</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <div className="font-medium text-foreground">India</div>
                            <div className="text-sm text-muted-foreground">Global Operations</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <div className="font-medium text-foreground">24/7 Support</div>
                            <div className="text-sm text-muted-foreground">For enterprise customers</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <div className="font-medium text-foreground">hello@proxinex.com</div>
                            <div className="text-sm text-muted-foreground">General inquiries</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-card border border-primary/30">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Enterprise Customers
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Need dedicated support or custom solutions? Our enterprise team is ready to help.
                      </p>
                      <Button variant="outline" className="w-full">
                        Contact Enterprise Sales
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Contact;
