interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

// Unique Proxinex Logo - represents AI routing/control with interconnected nodes
const ProxinexIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Outer hexagonal frame */}
    <path
      d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      className="text-primary"
    />
    
    {/* Central node - the control center */}
    <circle
      cx="24"
      cy="24"
      r="6"
      className="fill-primary"
    />
    
    {/* Inner glow ring */}
    <circle
      cx="24"
      cy="24"
      r="4"
      className="fill-primary-foreground"
      opacity="0.3"
    />
    
    {/* Routing lines from center to vertices */}
    <line x1="24" y1="24" x2="24" y2="10" stroke="currentColor" strokeWidth="1.5" className="text-primary" opacity="0.7" />
    <line x1="24" y1="24" x2="36" y2="17" stroke="currentColor" strokeWidth="1.5" className="text-primary" opacity="0.7" />
    <line x1="24" y1="24" x2="36" y2="31" stroke="currentColor" strokeWidth="1.5" className="text-primary" opacity="0.7" />
    <line x1="24" y1="24" x2="24" y2="38" stroke="currentColor" strokeWidth="1.5" className="text-primary" opacity="0.7" />
    <line x1="24" y1="24" x2="12" y2="31" stroke="currentColor" strokeWidth="1.5" className="text-primary" opacity="0.7" />
    <line x1="24" y1="24" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5" className="text-primary" opacity="0.7" />
    
    {/* Outer nodes - representing different AI models/endpoints */}
    <circle cx="24" cy="10" r="3" className="fill-primary" />
    <circle cx="36" cy="17" r="3" className="fill-primary" />
    <circle cx="36" cy="31" r="3" className="fill-primary" />
    <circle cx="24" cy="38" r="3" className="fill-primary" />
    <circle cx="12" cy="31" r="3" className="fill-primary" />
    <circle cx="12" cy="17" r="3" className="fill-primary" />
    
    {/* Small accent dots on nodes */}
    <circle cx="24" cy="10" r="1.5" className="fill-background" />
    <circle cx="36" cy="17" r="1.5" className="fill-background" />
    <circle cx="36" cy="31" r="1.5" className="fill-background" />
    <circle cx="24" cy="38" r="1.5" className="fill-background" />
    <circle cx="12" cy="31" r="1.5" className="fill-background" />
    <circle cx="12" cy="17" r="1.5" className="fill-background" />
  </svg>
);

export const Logo = ({ className = "", showText = true, size = "md" }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ProxinexIcon className={sizeClasses[size]} />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-semibold tracking-tight text-foreground ${textSizeClasses[size]}`}>
            PROXINEX
          </span>
          <span className="text-[10px] text-muted-foreground tracking-widest">
            BY CROPXON
          </span>
        </div>
      )}
    </div>
  );
};
