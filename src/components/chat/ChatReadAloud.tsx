import { useState } from "react";
import { Volume2, VolumeX, Loader2, Languages, Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ChatReadAloudProps {
  content: string;
  sessionTitle?: string;
}

type VoiceLanguage = "en" | "hi" | "or";

const languages: { value: VoiceLanguage; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "hi", label: "Hindi", flag: "🇮🇳" },
  { value: "or", label: "Odia (Experimental)", flag: "🇮🇳" },
];

// Voice options per language (using Web Speech API)
const getVoiceForLanguage = (lang: VoiceLanguage): string => {
  switch (lang) {
    case "en":
      return "en-US";
    case "hi":
      return "hi-IN";
    case "or":
      return "or-IN"; // Odia
    default:
      return "en-US";
  }
};

export const ChatReadAloud = ({ content, sessionTitle }: ChatReadAloudProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<VoiceLanguage>("en");
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Clean content for reading - remove markdown syntax
  const cleanContent = (text: string): string => {
    return text
      .replace(/#{1,6}\s/g, "") // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
      .replace(/\*([^*]+)\*/g, "$1") // Remove italic
      .replace(/`([^`]+)`/g, "$1") // Remove inline code
      .replace(/```[\s\S]*?```/g, "") // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links but keep text
      .replace(/\n+/g, ". ") // Replace newlines with periods
      .replace(/\s+/g, " ") // Normalize spaces
      .trim();
  };

  const handlePlay = async () => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported in your browser");
      return;
    }

    if (isPaused && currentUtterance) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    setIsLoading(true);

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const cleanedContent = cleanContent(content);
      const utterance = new SpeechSynthesisUtterance(cleanedContent);
      
      // Configure voice
      utterance.lang = getVoiceForLanguage(selectedLanguage);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Find a suitable voice
      const voices = window.speechSynthesis.getVoices();
      const targetLang = getVoiceForLanguage(selectedLanguage);
      const voice = voices.find(v => v.lang.startsWith(targetLang.split("-")[0]));
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        setIsLoading(false);
        setIsPlaying(true);
        toast.success(`Reading in ${languages.find(l => l.value === selectedLanguage)?.label}`);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsLoading(false);
        setIsPlaying(false);
        toast.error("Failed to read content");
      };

      setCurrentUtterance(utterance);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("TTS error:", error);
      setIsLoading(false);
      toast.error("Failed to read content");
    }
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentUtterance(null);
  };

  const handleLanguageChange = (lang: VoiceLanguage) => {
    setSelectedLanguage(lang);
    // Stop current playback if any
    if (isPlaying || isPaused) {
      handleStop();
    }
    toast.success(`Language set to ${languages.find(l => l.value === lang)?.label}`);
  };

  const currentLang = languages.find(l => l.value === selectedLanguage);

  return (
    <div className="flex items-center gap-1">
      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5" disabled={isPlaying}>
            <Languages className="h-3.5 w-3.5" />
            <span className="text-xs">{currentLang?.flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs">Voice Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.value}
              onClick={() => handleLanguageChange(lang.value)}
              className={selectedLanguage === lang.value ? "bg-primary/10 text-primary" : ""}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Play/Pause/Stop Controls */}
      {isLoading ? (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      ) : isPlaying ? (
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handlePause}>
            <Pause className="h-4 w-4 text-primary" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleStop}>
            <Square className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      ) : isPaused ? (
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handlePlay}>
            <Play className="h-4 w-4 text-primary" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleStop}>
            <Square className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 gap-1.5"
          onClick={handlePlay}
          title="Read aloud"
        >
          <Volume2 className="h-4 w-4" />
          <span className="text-xs">Listen</span>
        </Button>
      )}
    </div>
  );
};
