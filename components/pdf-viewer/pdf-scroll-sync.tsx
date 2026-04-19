'use client'

import { useEffect } from "react";
import { useFormStore } from "@/lib/store";

/**
 * Custom hook to handle automatic scrolling to active form fields in the PDF
 * This provides the Form -> PDF direction of synchronization
 */
export function usePdfScrollSync() {
  // Subscribe only to activeFieldId to minimize re-renders
  const activeFieldId = useFormStore(state => state.activeFieldId);

  useEffect(() => {
    // Only scroll if there's an active field
    if (!activeFieldId) {
      return;
    }

    // Small delay to ensure DOM is updated before scrolling
    const timeoutId = setTimeout(() => {
      // Find the highlight element by ID
      const highlightElement = document.getElementById(`highlight-${activeFieldId}`);
      
      if (highlightElement) {
        // Scroll the highlight into view with smooth animation
        highlightElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center', // Center the field vertically in the viewport
          inline: 'nearest' // Don't scroll horizontally unless necessary
        });

        // Optional: Add a subtle flash effect to draw attention
        highlightElement.style.animation = 'none';
        setTimeout(() => {
          highlightElement.style.animation = 'pulse 0.5s ease-in-out';
        }, 100);
      } else {
        // If highlight not found, try to find by field ID in development
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Could not find highlight element for field ID: ${activeFieldId}`);
        }
      }
    }, 100); // 100ms delay

    // Cleanup timeout on effect cleanup
    return () => {
      clearTimeout(timeoutId);
    };
  }, [activeFieldId]);
}

// Add CSS animation for pulse effect
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `;
  
  // Only add if not already present
  if (!document.querySelector('style[data-pdf-sync]')) {
    style.setAttribute('data-pdf-sync', 'true');
    document.head.appendChild(style);
  }
}