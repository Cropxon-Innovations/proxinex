import proxinexLogo from "@/assets/proxinex-logo.png";

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

export const Logo = ({ className = "", showText = true, size = "md" }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={proxinexLogo} 
        alt="Proxinex Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
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
