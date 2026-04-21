'use client'

import { useEffect, useRef, useCallback } from "react";
import { useFormStore } from "@/lib/store";

/**
 * Custom hook to handle automatic scrolling to active form fields in the PDF
 * This provides the Form -> PDF direction of synchronization
 */
export function usePdfScrollSync() {
  // Subscribe only to activeFieldId to minimize re-renders
  const activeFieldId = useFormStore(state => state.activeFieldId);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToField = useCallback((fieldId: string) => {
    
    //TODO: Find a better way
    const highlightElement = document.querySelector(`[data-field-id="${fieldId}"]`) as HTMLElement;
    
    if (highlightElement) {
      // Scroll the highlight into view with smooth animation
      highlightElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center', // Center the field vertically in the viewport
        inline: 'nearest' // Don't scroll horizontally unless necessary
      });

      // Add pulse effect using CSS class instead of inline styles
      highlightElement.classList.remove('field-pulse');
      // Force reflow to restart animation
      void highlightElement.offsetHeight;
      highlightElement.classList.add('field-pulse');

      // Remove the class after animation completes
      setTimeout(() => {
        highlightElement.classList.remove('field-pulse');
      }, 500);
    }
  }, []);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only scroll if there's an active field
    if (!activeFieldId) {
      return;
    }

    // Small delay to ensure DOM is updated before scrolling
    timeoutRef.current = setTimeout(() => {
      scrollToField(activeFieldId);
    }, 100);

    // Cleanup timeout on effect cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeFieldId, scrollToField]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
}