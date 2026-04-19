/**
 * Accessibility utilities for better user experience
 */

/**
 * Enhanced keyboard navigation handler
 */
export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  onActivate: () => void,
  options?: {
    preventDefault?: boolean;
    stopPropagation?: boolean;
  }
) {
  const { preventDefault = true, stopPropagation = false } = options || {};
  
  if (event.key === 'Enter' || event.key === ' ') {
    if (preventDefault) event.preventDefault();
    if (stopPropagation) event.stopPropagation();
    onActivate();
  }
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private static trapStack: HTMLElement[] = [];

  /**
   * Trap focus within a container element
   */
  static trapFocus(container: HTMLElement) {
    this.trapStack.push(container);
    
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return;

    // Focus first element
    focusableElements[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }

      if (event.key === 'Escape') {
        this.releaseFocus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    container.setAttribute('data-focus-trapped', 'true');

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeAttribute('data-focus-trapped');
      this.trapStack.pop();
    };
  }

  /**
   * Release focus trap
   */
  static releaseFocus() {
    const container = this.trapStack.pop();
    if (container) {
      container.removeAttribute('data-focus-trapped');
    }
  }

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll<HTMLElement>(selector))
      .filter(el => {
        return el.offsetWidth > 0 && 
               el.offsetHeight > 0 && 
               !el.hasAttribute('hidden');
      });
  }

  /**
   * Restore focus to a previously focused element
   */
  static restoreFocus(element: HTMLElement | null) {
    if (element && element.focus) {
      // Use setTimeout to ensure the element is available in the DOM
      setTimeout(() => element.focus(), 0);
    }
  }
}

/**
 * Screen reader announcements
 */
export class ScreenReaderAnnouncer {
  private static liveRegion: HTMLElement | null = null;

  /**
   * Initialize the live region for announcements
   */
  static initialize() {
    if (this.liveRegion) return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('class', 'sr-only');
    this.liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;

    document.body.appendChild(this.liveRegion);
  }

  /**
   * Announce a message to screen readers
   */
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.liveRegion) {
      this.initialize();
    }

    if (this.liveRegion) {
      this.liveRegion.setAttribute('aria-live', priority);
      this.liveRegion.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        if (this.liveRegion) {
          this.liveRegion.textContent = '';
        }
      }, 1000);
    }
  }

  /**
   * Announce form validation errors
   */
  static announceValidationError(fieldName: string, error: string) {
    this.announce(`Error in ${fieldName}: ${error}`, 'assertive');
  }

  /**
   * Announce successful actions
   */
  static announceSuccess(message: string) {
    this.announce(message, 'polite');
  }
}

/**
 * Reduced motion detection
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Color contrast utilities
 */
export function getContrastColor(backgroundColor: string): 'light' | 'dark' {
  // Simple implementation - in production you'd want a more sophisticated algorithm
  const rgb = backgroundColor.match(/\d+/g);
  if (!rgb) return 'light';

  const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
  return brightness > 125 ? 'dark' : 'light';
}

/**
 * ARIA label generators
 */
export const ariaLabels = {
  pdfField: (fieldName: string, confidence: number, page: number) => 
    `Form field ${fieldName} on page ${page}, detected with ${Math.round(confidence * 100)}% confidence. Click to edit.`,
  
  uploadArea: (isDragging: boolean) =>
    isDragging 
      ? 'Drop PDF file here to analyze form fields'
      : 'Click to select PDF file or drag and drop here',

  progressIndicator: (progress: number) =>
    `Analysis progress: ${progress}% complete`,

  formField: (fieldName: string, fieldType: string, isRequired?: boolean) =>
    `${fieldName} ${fieldType} field${isRequired ? ', required' : ''}`,

  navigationButton: (action: string, currentPage: number, totalPages: number) =>
    `${action} page. Currently on page ${currentPage} of ${totalPages}`,
};

/**
 * Initialize accessibility features
 */
export function initializeAccessibility() {
  ScreenReaderAnnouncer.initialize();

  // Add focus-visible polyfill behavior for better keyboard navigation
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        document.body.classList.add('using-keyboard');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('using-keyboard');
    });
  }
}