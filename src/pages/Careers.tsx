import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  ArrowRight, 
  Heart, 
  Zap, 
  Globe,
  Users,
  Coffee,
  BookOpen
} from "lucide-react";

const openPositions = [
  {
    id: 1,
    title: "Senior Backend Engineer",
    department: "Engineering",
    location: "Remote / India",
    type: "Full-time",
    description: "Build and scale the core AI routing infrastructure that powers Proxinex."
  },
  {
    id: 2,
    title: "ML/AI Engineer",
    department: "AI Research",
    location: "Remote / India",
    type: "Full-time",
    description: "Design and implement accuracy scoring algorithms and model routing optimization."
  },
  {
    id: 3,
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    description: "Shape the future of AI interfaces with intuitive, trust-building designs."
  },
  {
    id: 4,
    title: "Developer Advocate",
    department: "Developer Relations",
    location: "Remote",
    type: "Full-time",
    description: "Help developers integrate Proxinex and build amazing AI-powered applications."
  },
  {
    id: 5,
    title: "Technical Writer",
    department: "Documentation",
    location: "Remote",
    type: "Contract",
    description: "Create clear, comprehensive documentation for our APIs and SDKs."
  }
];

const benefits = [
  {
    icon: Globe,
    title: "Remote-First",
    description: "Work from anywhere. We believe great talent isn't limited by geography."
  },
  {
    icon: Zap,
    title: "Cutting-Edge Tech",
    description: "Work with the latest AI technologies and shape the future of intelligent systems."
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    description: "Comprehensive health coverage and wellness programs for you and your family."
  },
  {
    icon: BookOpen,
    title: "Learning Budget",
    description: "Annual budget for courses, conferences, and continuous learning."
  },
  {
    icon: Coffee,
    title: "Flexible Hours",
    description: "We trust you to manage your time. Focus on outcomes, not hours."
  },
  {
    icon: Users,
    title: "Great Team",
    description: "Work with passionate people who care about building something meaningful."
  }
];

const Careers = () => {
  return (
    <>
      <Helmet>
        <title>Careers at Proxinex - Join Our Team</title>
        <meta 
          name="description" 
          content="Join the Proxinex team and help build the future of AI intelligence control. We're hiring engineers, designers, and more. Remote-first culture." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24">
          {/* Hero Section */}
          <section className="py-20 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
                  We're Hiring
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                  Build the Future of AI
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join a team that's redefining how people interact with AI. 
                  We're building technology that brings transparency and control to artificial intelligence.
                </p>
              </div>
            </div>
          </section>

          {/* Culture Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-foreground text-center mb-4">
                  Why Proxinex?
                </h2>
                <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                  We're not just another AI company. We're building tools that give people control 
                  and transparency in an increasingly AI-driven world.
                </p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {benefits.map((benefit, index) => (
                    <div 
                      key={benefit.title}
                      className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all animate-fade-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <benefit.icon className="h-10 w-10 text-primary mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Open Positions */}
          <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-foreground text-center mb-4">
                  Open Positions
                </h2>
                <p className="text-center text-muted-foreground mb-12">
                  Find your next role at Proxinex. We're always looking for talented people.
                </p>

                <div className="space-y-4">
                  {openPositions.map((position, index) => (
                    <div 
                      key={position.id}
                      className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all animate-fade-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {position.department}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {position.type}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                            {position.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {position.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{position.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              <span>{position.department}</span>
                            </div>
                          </div>
                        </div>
                        <Button className="flex-shrink-0 group/btn">
                          Apply Now
                          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Don't See Your Role?
                </h2>
                <p className="text-muted-foreground mb-6">
                  We're always interested in meeting talented people. Send us your resume 
                  and tell us how you'd like to contribute.
                </p>
                <Button variant="outline" size="lg">
                  Send Open Application
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Careers;
