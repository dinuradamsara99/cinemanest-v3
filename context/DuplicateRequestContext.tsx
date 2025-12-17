"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface DuplicateRequestContextType {
  triggerAnimation: () => void;
  isAnimating: boolean;
}

const DuplicateRequestContext = createContext<DuplicateRequestContextType | undefined>(undefined);

export function DuplicateRequestProvider({ children }: { children: ReactNode }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerAnimation = useCallback(() => {
    setIsAnimating(true);
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000); // Animation duration
  }, []);

  return (
    <DuplicateRequestContext.Provider value={{ triggerAnimation, isAnimating }}>
      {children}
    </DuplicateRequestContext.Provider>
  );
}

export function useDuplicateRequest() {
  const context = useContext(DuplicateRequestContext);
  if (!context) {
    throw new Error("useDuplicateRequest must be used within DuplicateRequestProvider");
  }
  return context;
}

