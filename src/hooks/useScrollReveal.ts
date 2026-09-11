"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const { threshold = 0.08, rootMargin = "20px 0px -50px 0px", once = false } = options;
  const elementRef = useRef<any>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Check immediately on mount so top elements (Hero) are visible instantly without delay
    if (typeof window !== "undefined") {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setIsRevealed(true);
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
        } else {
          setIsRevealed(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return { ref: elementRef, isRevealed };
}
