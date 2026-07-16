"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Function to scroll to top
    const scrollToTop = () => {
      // Try multiple methods to ensure scrolling works
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      
      // Also try scrolling the document element
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    
    // Immediate scroll
    scrollToTop();
    
    // Also scroll after a short delay and when DOM is ready
    const timeoutId = setTimeout(scrollToTop, 50);
    const secondTimeoutId = setTimeout(scrollToTop, 200);
    
    // Also listen for load event
    const handleLoad = () => scrollToTop();
    window.addEventListener('load', handleLoad);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(secondTimeoutId);
      window.removeEventListener('load', handleLoad);
    };
  }, [pathname]);

  // Also add a global CSS style to prevent scroll restoration
  useEffect(() => {
    // Disable browser's scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return null;
}