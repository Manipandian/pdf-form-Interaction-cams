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

## PDF Viewer Components

### react-pdf Configuration
- PDF.js worker must be configured at module level before component usage
- Import required CSS: AnnotationLayer.css and TextLayer.css
- Canvas aliasing configured in next.config.ts for Node.js compatibility

### Coordinate System
- Overlays use percentage-based positioning from normalized 0-1 coordinates
- PDF dimensions converted from points to inches (72 points = 1 inch)
- ResizeObserver ensures responsive rendering across screen sizes

### Performance Patterns
- Use React.memo for PDF pages to prevent re-renders
- Selective Zustand subscriptions prevent unnecessary updates
- Page filtering reduces overlay rendering overhead

### Synchronization
- Form -> PDF: usePdfScrollSync hook with scrollIntoView
- PDF -> Form: Click handlers on overlays call setActiveField
- Smooth animations with Framer Motion for visual feedback

### Multi-page Support
- All pages rendered in single scrollable container
- Page navigation with prev/next buttons and jump-to input
- Individual page IDs for direct scrolling

## Dynamic Form Components

### react-hook-form Integration
- Dynamic Zod schema generation based on extracted PDF fields
- FormProvider pattern for nested component form access
- Real-time validation with onChange mode
- Default values preserved from AI extraction

### Field Type Support
- Text fields: String validation with length limits
- Number fields: Numeric conversion with currency symbol handling
- Checkbox fields: Boolean state management with visual feedback
- Extensible architecture for additional field types

### Bidirectional Synchronization
- Form -> PDF: onFocus/onBlur handlers update activeFieldId
- PDF -> Form: useEffect responds to activeFieldId changes with scrollIntoView
- Checkbox special handling: Auto-clear active field after 1 second
- Smooth scroll with 'center' block positioning

### Form State Management
- react-hook-form for local form state and validation
- Zustand store for cross-component state (activeFieldId, field values)
- Watch subscription syncs form changes back to Zustand
- Form reset preserves AI-extracted default values

### Visual Feedback
- Active field highlighting with pulsing border animation
- Confidence badges showing AI extraction quality
- Error message display with ARIA attributes
- Page grouping for multi-page forms

### Performance Optimizations
- Memoized schema and default values prevent rebuilds
- Selective Zustand subscriptions minimize re-renders
- Field sorting by vertical position within pages
- Debounced form value synchronization

## Layout Components

### Responsive Dashboard Design
- Mobile-first approach with 1024px breakpoint
- Mobile: Tabs switching between PDF and Form views
- Desktop: Side-by-side 50/50 split layout
- Window resize listener for dynamic breakpoint detection

### State-Driven UI
- Application states: upload, analyzing, error, no-fields, dashboard
- Conditional rendering based on Zustand store state
- Different panel content for each application state
- Loading skeletons during transitions

### File Upload System
- Drag-and-drop with visual feedback and animations
- File validation: PDF only, 10MB limit, non-empty files
- Progress tracking with incremental updates
- Two variants: full upload UI and compact retry button

### Error Handling
- Toast notifications for user feedback
- Contextual error messages in panel areas
- Recovery actions with retry functionality
- Graceful degradation for analysis failures

### Performance Patterns
- Selective Zustand subscriptions prevent layout re-renders
- Efficient breakpoint detection without polling
- Component-level loading states
- File object URL cleanup