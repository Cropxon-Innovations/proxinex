import { useState, useEffect } from "react";

export type Currency = "INR" | "USD";

export const useCurrency = () => {
  const [currency, setCurrency] = useState<Currency>("INR");
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        // Check localStorage first for user preference
        const savedCurrency = localStorage.getItem("preferred_currency");
        if (savedCurrency === "INR" || savedCurrency === "USD") {
          setCurrency(savedCurrency);
          setIsDetecting(false);
          return;
        }

        // Try to detect based on timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.startsWith("Asia/Kolkata") || timezone.startsWith("Asia/Calcutta")) {
          setCurrency("INR");
          setIsDetecting(false);
          return;
        }

        // Try to detect based on locale
        const locale = navigator.language || navigator.languages?.[0];
        if (locale?.includes("IN") || locale?.includes("hi") || locale === "en-IN") {
          setCurrency("INR");
          setIsDetecting(false);
          return;
        }

        // Fallback to IP-based detection
        const response = await fetch("https://ipapi.co/json/", { 
          signal: AbortSignal.timeout(3000) 
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.country_code === "IN") {
            setCurrency("INR");
          } else {
            setCurrency("USD");
          }
        }
      } catch {
        // Default to INR on error (for Indian market focus)
        setCurrency("INR");
      } finally {
        setIsDetecting(false);
      }
    };

    detectCurrency();
  }, []);

  const updateCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem("preferred_currency", newCurrency);
  };

  return { currency, setCurrency: updateCurrency, isDetecting };
};
