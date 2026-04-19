# Layout Components Guidelines

## Dashboard Layout Architecture
- Responsive design with mobile-first approach
- Mobile: Tabs for switching between PDF and Form views
- Desktop: Side-by-side 50/50 split layout
- Breakpoint at 1024px (lg) for adequate panel space

## State-Driven Conditional Rendering
- Application states: upload, analyzing, error, no-fields, dashboard
- State determined by: pdfUrl, isAnalyzing, analysisError, fields.length
- Different content rendered for PDF and Form panels based on state

## File Upload Component
- Drag and drop functionality with visual feedback
- File validation: PDF only, max 10MB, non-empty
- Progress tracking during analysis
- Two variants: default (full upload UI) and retry (compact button)
- Framer Motion animations for enhanced UX

## Responsive Design Patterns
- Mobile breakpoint detection with window resize listener
- Conditional component rendering based on screen size
- Tabs component for mobile navigation between panels
- Hidden elements on small screens with responsive classes

## Error Handling & User Feedback
- Toast notifications for success/error states
- Contextual error messages in panel content
- Loading skeletons during analysis
- Recovery actions (retry upload button)

## Performance Considerations
- Selective Zustand subscriptions to prevent unnecessary re-renders
- Efficient responsive breakpoint detection
- Component-level loading states
- Optimized file processing with validation

## Integration Points
- Zustand store for global state management
- PDF viewer and form components as lazy-loaded children
- Toast system for user notifications
- File object URL management for PDF display