import { Link, useLocation } from "react-router-dom";
import { MessageSquare, Search, Settings, PenLine, History } from "lucide-react";

interface MobileBottomNavProps {
  onNewChat?: () => void;
}

export const MobileBottomNav = ({ onNewChat }: MobileBottomNavProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: PenLine, label: "New", path: "/app", onClick: onNewChat, isAction: true },
    { icon: MessageSquare, label: "Chat", path: "/app/chat" },
    { icon: Search, label: "Research", path: "/app/research" },
    { icon: History, label: "History", path: "/app/chat" },
    { icon: Settings, label: "Settings", path: "/app/settings" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path) && !item.isAction;

          if (item.isAction) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors text-primary"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
              </button>
            );
          }

          return (
            <Link
              key={item.path + item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
