import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { ProxinexIcon } from "@/components/Logo";
import { Users, Target, Lightbulb, Globe, Award, Heart } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Precision",
    description: "We believe in accuracy over speed. Every answer should be verifiable and trustworthy."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Pushing the boundaries of what AI can do while keeping humans in control."
  },
  {
    icon: Users,
    title: "Transparency",
    description: "No black boxes. See exactly how decisions are made and what they cost."
  },
  {
    icon: Heart,
    title: "User-First",
    description: "Every feature is designed with the end user's needs and trust in mind."
  }
];

const milestones = [
  { year: "2025", month: "August", event: "Proxinex founded as a division of OriginX Labs PVT. LTD" },
  { year: "2025", month: "September", event: "Alpha release with core routing and accuracy scoring" },
  { year: "2025", month: "October", event: "Inline Ask™ feature launched" },
  { year: "2025", month: "November", event: "Beta program opened to early adopters" },
  { year: "2025", month: "December", event: "Enterprise tier announced" },
  { year: "2026", month: "January", event: "Public beta with full API access" }
];

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Proxinex - Our Mission & Story</title>
        <meta 
          name="description" 
          content="Learn about Proxinex, a division of OriginX Labs PVT. LTD. Our mission is to bring transparency and control to AI intelligence." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24">
          {/* Hero Section */}
          <section className="py-20 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="flex justify-center mb-8">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <ProxinexIcon className="w-16 h-16 text-primary" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up">
                  Control Intelligence.
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
                  Proxinex is the AI Intelligence Control Plane—built to give you transparency, 
                  accuracy, and control over every AI interaction.
                </p>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
                    <p className="text-muted-foreground mb-4">
                      We believe AI should be transparent, not opaque. Every organization deserves 
                      to know exactly which AI model is answering their questions, how confident 
                      the answer is, and what it costs.
                    </p>
                    <p className="text-muted-foreground">
                      Proxinex was built to eliminate the black box problem in AI. We route your 
                      queries to the optimal model, verify accuracy with citations, and give you 
                      complete cost transparency—all in one unified platform.
                    </p>
                  </div>
                  <div className="relative">
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-card to-primary/10 border border-border p-8 flex items-center justify-center">
                      <Globe className="w-32 h-32 text-primary/50 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-foreground text-center mb-12">Our Values</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {values.map((value, index) => (
                    <div 
                      key={value.title}
                      className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all animate-fade-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <value.icon className="h-10 w-10 text-primary mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Company Info */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-card border border-border">
                  <div className="flex items-start gap-4 mb-6">
                    <Award className="h-8 w-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        A Division of OriginX Labs PVT. LTD
                      </h3>
                      <p className="text-muted-foreground">
                        Proxinex is a product of OriginX Labs PVT. LTD, an Indian technology 
                        company focused on building intelligent solutions for the modern enterprise. 
                        Our parent company brings years of expertise in AI, cloud infrastructure, 
                        and enterprise software.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">2025</div>
                      <div className="text-sm text-muted-foreground">Founded</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">India</div>
                      <div className="text-sm text-muted-foreground">Headquarters</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">Beta</div>
                      <div className="text-sm text-muted-foreground">Current Phase</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">Global</div>
                      <div className="text-sm text-muted-foreground">Availability</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-foreground text-center mb-12">Our Journey</h2>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border" />
                  
                  {milestones.map((milestone, index) => (
                    <div 
                      key={index}
                      className={`relative flex items-center gap-8 mb-8 ${
                        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                    >
                      <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} hidden md:block`}>
                        <div className="p-4 rounded-lg bg-card border border-border inline-block">
                          <div className="text-sm text-primary font-medium">{milestone.month} {milestone.year}</div>
                          <div className="text-foreground">{milestone.event}</div>
                        </div>
                      </div>
                      
                      {/* Dot */}
                      <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-primary -translate-x-1/2 ring-4 ring-background" />
                      
                      <div className="flex-1 ml-12 md:ml-0 md:hidden">
                        <div className="p-4 rounded-lg bg-card border border-border">
                          <div className="text-sm text-primary font-medium">{milestone.month} {milestone.year}</div>
                          <div className="text-foreground">{milestone.event}</div>
                        </div>
                      </div>
                      
                      <div className="flex-1 hidden md:block" />
                    </div>
                  ))}
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

export default About;
