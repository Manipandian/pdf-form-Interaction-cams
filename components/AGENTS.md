# Components Module Guidelines

## Component Architecture
- All interactive components must use `'use client'` directive
- PDF viewer and form components are client components
- Layout wrappers can be server components when they don't need interactivity

## State Management
- Use Zustand selectors, not the entire store: `useFormStore(state => state.specificField)`
- Never use `useFormStore()` without selector to prevent unnecessary re-renders

## Styling
- Use Shadcn/UI components for consistent design
- Use Tailwind CSS classes with cn() utility for class merging
- All animations use Framer Motion

## Accessibility
- All form fields must have proper labels with htmlFor
- Use aria-label attributes for PDF viewer elements
- Include focus rings on interactive elements