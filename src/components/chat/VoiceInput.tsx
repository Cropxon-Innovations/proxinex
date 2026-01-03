import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Volume2, Languages, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition: new () => SpeechRecognitionInterface;
    proxinexSpeak?: (text: string) => void;
  }
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onVoiceResponse?: (text: string) => void;
  isLoading?: boolean;
}

const languages = [
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "hi-IN", name: "Hindi" },
  { code: "es-ES", name: "Spanish" },
  { code: "fr-FR", name: "French" },
  { code: "de-DE", name: "German" },
  { code: "ja-JP", name: "Japanese" },
  { code: "zh-CN", name: "Chinese" },
  { code: "ar-SA", name: "Arabic" },
  { code: "pt-BR", name: "Portuguese" },
  { code: "ko-KR", name: "Korean" },
  { code: "ru-RU", name: "Russian" },
  { code: "it-IT", name: "Italian" },
  { code: "ta-IN", name: "Tamil" },
  { code: "te-IN", name: "Telugu" },
  { code: "bn-IN", name: "Bengali" },
];

export const VoiceInput = ({ onTranscript, onVoiceResponse, isLoading }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [showLanguages, setShowLanguages] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + " " + finalTranscript);
          onTranscript(finalTranscript);
        } else if (interimTranscript) {
          setTranscript(interimTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (isRecording && recognitionRef.current) {
          recognitionRef.current.start();
          setIsListening(true);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, isRecording, onTranscript]);

  const startRecording = useCallback(() => {
    if (recognitionRef.current) {
      setIsRecording(true);
      setTranscript("");
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [language]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 1;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Expose speakText for external use
  useEffect(() => {
    if (onVoiceResponse) {
      window.proxinexSpeak = speakText;
    }
  }, [speakText, onVoiceResponse]);

  const hasSpeechRecognition = typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  if (!hasSpeechRecognition) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {/* Language Selector */}
      <Popover open={showLanguages} onOpenChange={setShowLanguages}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Languages className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="end">
          <div className="text-xs font-medium text-muted-foreground mb-2">Voice Language</div>
          <Select value={language} onValueChange={(v) => { setLanguage(v); setShowLanguages(false); }}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PopoverContent>
      </Popover>

      {/* Voice Record Button */}
      <Button
        variant={isRecording ? "destructive" : "ghost"}
        size="icon"
        className={`h-8 w-8 ${isRecording ? "animate-pulse" : ""}`}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isLoading}
      >
        {isRecording ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {/* Text-to-Speech Button */}
      <Button
        variant={isSpeaking ? "default" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={isSpeaking ? stopSpeaking : undefined}
        disabled={!isSpeaking && isLoading}
      >
        {isSpeaking ? (
          <X className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 px-2 py-1 bg-destructive/20 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-xs text-destructive">
            {isListening ? "Listening..." : "Starting..."}
          </span>
          {transcript && (
            <span className="text-xs text-muted-foreground max-w-[150px] truncate">
              {transcript}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Hook for external access to speak functionality
export const useSpeech = () => {
  const speak = useCallback((text: string, lang = "en-US") => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return { speak };
};
