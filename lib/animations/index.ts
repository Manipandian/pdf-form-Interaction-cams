import type { Variants } from "framer-motion";

/**
 * Centralized animation configurations for consistent motion design
 * Follows material design and modern UI animation principles
 */

// Easing configurations for natural motion
export const easing = {
  // Standard ease for general transitions
  standard: [0.4, 0.0, 0.2, 1],
  // Emphasized ease for important state changes
  emphasized: [0.0, 0.0, 0.2, 1],
  // Decelerated ease for elements entering
  decelerated: [0.0, 0.0, 0.2, 1],
  // Accelerated ease for elements exiting
  accelerated: [0.4, 0.0, 1, 1],
} as const;

// Duration tokens for consistent timing
export const duration = {
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  slower: 0.5,
} as const;

/**
 * Page transition animations for route changes and view switching
 */
export const pageTransitions: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.decelerated,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: duration.fast,
      ease: easing.accelerated,
    },
  },
};

/**
 * Stagger animations for lists and grids
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.decelerated,
    },
  },
};

/**
 * Modal and overlay animations
 */
export const modalBackdrop: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: duration.fast,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: duration.fast,
    },
  },
};

export const modalContent: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.decelerated,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: duration.fast,
      ease: easing.accelerated,
    },
  },
};

/**
 * Card and panel animations
 */
export const cardHover: Variants = {
  initial: {
    scale: 1,
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    transition: {
      duration: duration.fast,
      ease: easing.standard,
    },
  },
};

/**
 * Button animations
 */
export const buttonTap = {
  scale: 0.95,
  transition: {
    duration: 0.1,
    ease: easing.standard,
  },
};

/**
 * Loading and progress animations
 */
export const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.7, 1, 0.7],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: easing.standard,
  },
};

/**
 * Field focus animations - visual-only overlays for Form → PDF highlighting
 */
export const fieldFocus: Variants = {
  initial: {
    borderColor: "transparent",
    backgroundColor: "transparent",
    boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)",
  },
  active: {
    borderColor: ["#3b82f6", "#60a5fa", "#3b82f6"],
    backgroundColor: "transparent",
    boxShadow: [
      "0 0 0 3px rgba(59, 130, 246, 0.2)",
      "0 0 0 6px rgba(59, 130, 246, 0.3)",
      "0 0 0 3px rgba(59, 130, 246, 0.2)",
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: easing.standard,
    },
  },
};

/**
 * Toast notification animations
 */
export const toastSlideIn: Variants = {
  initial: {
    opacity: 0,
    x: "100%",
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: "100%",
    scale: 0.9,
    transition: {
      duration: duration.fast,
      ease: easing.accelerated,
    },
  },
};

/**
 * Progress bar animations
 */
export const progressBar: Variants = {
  initial: {
    scaleX: 0,
    originX: 0,
  },
  animate: {
    scaleX: 1,
    transition: {
      duration: duration.slow,
      ease: easing.decelerated,
    },
  },
};

/**
 * Skeleton loading animations
 */
export const skeletonPulse = {
  opacity: [0.4, 0.8, 0.4],
  transition: {
    duration: 1.2,
    repeat: Infinity,
    ease: easing.standard,
  },
};

/**
 * Drag and drop animations
 */
export const draggedItem: Variants = {
  drag: {
    scale: 1.05,
    rotate: 5,
    boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    transition: {
      duration: duration.fast,
    },
  },
};

/**
 * Success and error state animations
 */
export const successPulse = {
  scale: [1, 1.1, 1],
  transition: {
    duration: 0.6,
    times: [0, 0.5, 1],
    ease: easing.emphasized,
  },
};

export const errorShake = {
  x: [0, -5, 5, -5, 5, 0],
  transition: {
    duration: 0.5,
    ease: easing.standard,
  },
};

/**
 * Page section reveal animations for better perceived performance
 */
export const sectionReveal: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.decelerated,
    },
  },
};

/**
 * Utility function to create spring animations
 */
export const springConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
};

/**
 * Layout transition configuration for layout animations
 */
export const layoutTransition = {
  type: "spring" as const,
  stiffness: 500,
  damping: 40,
  mass: 1,
};