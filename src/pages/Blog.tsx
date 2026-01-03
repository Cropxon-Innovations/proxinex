import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import { Link } from "react-router-dom";

const blogPosts = [
  {
    id: 1,
    title: "Introducing Proxinex: The AI Intelligence Control Plane",
    excerpt: "Today we're launching Proxinex in public beta—a new way to interact with AI that puts you in control of model selection, accuracy verification, and cost transparency.",
    author: "Proxinex Team",
    date: "January 2, 2026",
    readTime: "5 min read",
    category: "Announcements",
    featured: true
  },
  {
    id: 2,
    title: "Why We Built Inline Ask™",
    excerpt: "Traditional AI interfaces give you an answer and leave you wondering. Inline Ask™ lets you dig deeper into any part of a response without losing context.",
    author: "Proxinex Team",
    date: "December 15, 2025",
    readTime: "4 min read",
    category: "Product"
  },
  {
    id: 3,
    title: "The Problem with AI Black Boxes",
    excerpt: "Most AI platforms hide the details. Which model answered? How confident is it? What did it cost? We believe transparency should be the default, not a premium feature.",
    author: "Proxinex Team",
    date: "November 28, 2025",
    readTime: "6 min read",
    category: "Insights"
  },
  {
    id: 4,
    title: "How Smart Model Routing Works",
    excerpt: "Not every query needs the most expensive model. Learn how Proxinex analyzes your intent and routes to the optimal AI for accuracy, speed, and cost.",
    author: "Proxinex Team",
    date: "November 10, 2025",
    readTime: "7 min read",
    category: "Technical"
  },
  {
    id: 5,
    title: "Beta Program Launch: What to Expect",
    excerpt: "We're opening our beta program to early adopters. Here's what's included, what we're testing, and how you can help shape the future of Proxinex.",
    author: "Proxinex Team",
    date: "October 25, 2025",
    readTime: "3 min read",
    category: "Announcements"
  },
  {
    id: 6,
    title: "Accuracy Scoring: Trust What AI Tells You",
    excerpt: "Every Proxinex response includes an accuracy score backed by source citations. Learn how we calculate confidence and why it matters for enterprise use.",
    author: "Proxinex Team",
    date: "October 8, 2025",
    readTime: "5 min read",
    category: "Product"
  }
];

const categories = ["All", "Announcements", "Product", "Technical", "Insights"];

const Blog = () => {
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <>
      <Helmet>
        <title>Blog - Proxinex Insights & Updates</title>
        <meta 
          name="description" 
          content="Stay updated with the latest news, product updates, and insights from the Proxinex team. Learn about AI intelligence control, accuracy scoring, and more." 
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
                  Proxinex Blog
                </h1>
                <p className="text-xl text-muted-foreground">
                  Insights, updates, and deep dives into AI intelligence control.
                </p>
              </div>
            </div>
          </section>

          {/* Categories */}
          <section className="py-6 border-b border-border sticky top-16 bg-background/95 backdrop-blur z-10">
            <div className="container mx-auto px-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      category === "All"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Post */}
          {featuredPost && (
            <section className="py-12">
              <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                  <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-card to-primary/5 border border-border p-8 md:p-12">
                    <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                      Featured
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 max-w-3xl">
                      {featuredPost.title}
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{featuredPost.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{featuredPost.readTime}</span>
                      </div>
                    </div>
                    <button className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
                      Read Article
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Blog Grid */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post, index) => (
                    <article 
                      key={post.id}
                      className="group rounded-xl border border-border bg-card hover:border-primary/50 transition-all overflow-hidden animate-fade-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="aspect-video bg-gradient-to-br from-primary/10 to-card" />
                      <div className="p-6">
                        <Badge variant="secondary" className="mb-3">
                          {post.category}
                        </Badge>
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{post.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Newsletter CTA */}
          <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Stay Updated
                </h2>
                <p className="text-muted-foreground mb-6">
                  Get the latest insights and updates from Proxinex delivered to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                    Subscribe
                  </button>
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

export default Blog;
