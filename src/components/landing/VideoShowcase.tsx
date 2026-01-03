import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

const SUPABASE_URL = "https://jfmrvhrpwyxxjpcblavp.supabase.co";
const VIDEO_URL = `${SUPABASE_URL}/storage/v1/object/public/proxinex/Proxinex__AI_Control_Plane.mp4`;

export const VideoShowcase = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Autoplay when scrolling into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAutoPlayed && videoRef.current) {
            videoRef.current.play().then(() => {
              setIsPlaying(true);
              setHasAutoPlayed(true);
            }).catch(() => {
              // Autoplay blocked by browser, user will need to click
            });
          } else if (!entry.isIntersecting && videoRef.current && isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasAutoPlayed, isPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background via-card/30 to-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Play className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">See It In Action</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Watch How Proxinex{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Controls Intelligence
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Experience the seamless flow from query to verified answer — no black boxes, no guesswork.
          </p>
        </div>

        {/* Video Container */}
        <div 
          ref={containerRef}
          className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/50 group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Decorative glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
          
        {/* Video wrapper */}
        <div className="relative bg-card rounded-2xl overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-card to-muted/30 relative">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
            >
              <source src={VIDEO_URL} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

              {/* Play overlay when paused */}
              {!isPlaying && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm cursor-pointer transition-all duration-300"
                  onClick={togglePlay}
                >
                  <div className="relative">
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 animate-ping bg-primary/30 rounded-full" style={{ animationDuration: '2s' }} />
                    <div className="relative w-20 h-20 md:w-24 md:h-24 bg-primary/90 hover:bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-110">
                      <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
              )}

              {/* Custom controls */}
              <div 
                className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent transition-opacity duration-300 ${
                  showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-background/50 hover:bg-background/70 backdrop-blur-sm"
                      onClick={togglePlay}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-foreground" />
                      ) : (
                        <Play className="w-5 h-5 text-foreground ml-0.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-background/50 hover:bg-background/70 backdrop-blur-sm"
                      onClick={toggleMute}
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-foreground" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-foreground" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      Proxinex AI Control Plane
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-background/50 hover:bg-background/70 backdrop-blur-sm"
                      onClick={handleFullscreen}
                    >
                      <Maximize className="w-5 h-5 text-foreground" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Caption */}
        <p className="text-center text-sm text-muted-foreground mt-6 max-w-2xl mx-auto">
          From intelligent routing to verified results — see why enterprises trust Proxinex for mission-critical AI.
        </p>
      </div>
    </section>
  );
};
