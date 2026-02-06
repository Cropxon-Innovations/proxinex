import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ProxinexIcon } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Proxinex</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to Proxinex - AI Intelligence Control Plane." />
      </Helmet>
      
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        {/* Animated Proxinex Logo */}
        <div className="mb-8 animate-pulse">
          <ProxinexIcon className="h-24 w-24 text-primary" />
        </div>

        {/* Brand name */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-wider text-foreground">PROXINEX</h1>
          <p className="text-xs text-muted-foreground tracking-widest">BY ORIGINX LABS</p>
        </div>

        {/* 404 Message */}
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-8xl font-bold text-primary">404</h2>
          <h3 className="text-2xl font-semibold text-foreground">Page Not Found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back to the AI Intelligence Control Plane.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild variant="default" size="lg">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" onClick={() => window.history.back()}>
            <button onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </button>
          </Button>
        </div>

        {/* Footer branding */}
        <div className="absolute bottom-8 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by <span className="font-medium">OriginX Labs PVT. LTD</span>
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            Building the Future of AI Intelligence
          </p>
        </div>
      </div>
    </>
  );
};

export default NotFound;
