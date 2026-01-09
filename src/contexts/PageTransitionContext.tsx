import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { PageLoader } from "@/components/PageLoader";

interface PageTransitionContextType {
  isLoading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  isLoading: false,
  showLoader: () => {},
  hideLoader: () => {},
});

export const usePageTransition = () => useContext(PageTransitionContext);

interface PageTransitionProviderProps {
  children: ReactNode;
}

export const PageTransitionProvider = ({ children }: PageTransitionProviderProps) => {
  const [isLoading, setIsLoading] = useState(true); // Start with loading for initial page load
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const location = useLocation();

  // Show loader on initial page load
  useEffect(() => {
    if (isInitialLoad) {
      // Initial load - show full loader
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsInitialLoad(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

  // Show loader on route changes (not initial)
  useEffect(() => {
    if (!isInitialLoad) {
      setIsLoading(true);
    }
  }, [location.pathname, isInitialLoad]);

  const showLoader = useCallback(() => {
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleLoaderComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <PageTransitionContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {isLoading && <PageLoader onComplete={handleLoaderComplete} minimal={!isInitialLoad} />}
      {children}
    </PageTransitionContext.Provider>
  );
};
