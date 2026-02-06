import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  Shield, 
  Zap, 
  Lock,
  CheckCircle
} from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const features = [
  { icon: Shield, text: "Enterprise-grade security" },
  { icon: Zap, text: "Intelligent AI routing" },
  { icon: Lock, text: "Full data control" },
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input
      const validation = authSchema.safeParse({ email, password });
      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          navigate("/app");
        }
      } else {
        const redirectUrl = `${window.location.origin}/app`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign Up Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account Created!",
            description: "Welcome to Proxinex. You're now signed in.",
          });
          navigate("/app");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isLogin ? "Sign In" : "Create Account"} - Proxinex | AI Intelligence Control Plane</title>
        <meta name="description" content="Sign in to Proxinex - The AI Intelligence Control Plane. Access intelligent model routing, accuracy scoring, and cost transparency for your AI workflows." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://proxinex.com/auth" />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-card border-r border-border">
          {/* Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }} />
          </div>

          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
            <Link to="/" className="mb-12">
              <Logo size="lg" />
            </Link>

            <h1 className="text-4xl xl:text-5xl font-bold text-foreground mb-6 leading-tight">
              Control Your AI.
              <br />
              <span className="text-primary">Trust Your Results.</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-12 max-w-md">
              The AI Intelligence Control Plane that gives you transparency, accuracy scoring, and cost control.
            </p>

            {/* Feature list */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 text-muted-foreground"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Company branding */}
            <div className="absolute bottom-8 left-12 xl:left-20">
              <p className="text-xs text-muted-foreground">
                A Product by{" "}
                <a 
                  href="https://www.originxlabs.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-foreground font-medium hover:text-primary transition-colors"
                >
                  OriginX Labs PVT. LTD
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link to="/">
              <Logo size="md" />
            </Link>
          </div>

          <div className="w-full max-w-md">
            {/* Auth Card */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-muted-foreground">
                  {isLogin
                    ? "Sign in to access your AI control plane"
                    : "Get started with Proxinex for free"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="h-12 bg-input border-border text-foreground"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-12 bg-input border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    {isLogin && (
                      <button
                        type="button"
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-12 bg-input border-border text-foreground pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 glow text-base group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </>
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              {/* Benefits for signup */}
              {!isLogin && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Free tier with 50 queries/day</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Access to all AI models</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>

            {/* Mobile company branding */}
            <div className="lg:hidden text-center mt-8">
              <p className="text-xs text-muted-foreground">
                A Product by{" "}
                <a 
                  href="https://www.originxlabs.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-foreground font-medium hover:text-primary transition-colors"
                >
                  OriginX Labs PVT. LTD
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
