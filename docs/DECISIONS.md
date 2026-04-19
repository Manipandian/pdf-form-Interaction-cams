# Technical Decisions Log

This document tracks all technical decisions made during the implementation of the AI PDF Form Interaction project.

## Plan 1: Project Foundation and Dependencies (April 17, 2026)

### Dependencies Selected
- **Zustand over Redux/Context**: Chosen for high-performance selective subscriptions to prevent PDF re-renders
- **react-pdf over PDF.js directly**: Provides React-friendly API while maintaining full control over rendering
- **Shadcn/UI over other component libraries**: Provides consistent, accessible components with Tailwind CSS integration
- **Framer Motion over CSS animations**: Enables complex layout animations and smooth transitions between states
- **Azure AI Document Intelligence over general LLMs**: Specialized IDP service provides deterministic OCR with precise coordinates, avoiding hallucination issues

### Configuration Decisions
- **Turbopack configuration**: Canvas aliased to empty module to resolve Node.js compatibility issues with PDF.js
- **Server external packages**: Azure SDK marked as external to prevent bundling issues
- **Environment variables**: Server-side only for security, using .env.local for development

### Architecture Decisions
- **Next.js 16 App Router**: Using latest stable version with async Request APIs
- **Client/Server boundary**: PDF rendering client-side, AI processing server-side
- **Coordinate system**: Normalized 0-1 scale for resolution independence
- **State management**: Single Zustand store as source of truth for cross-panel synchronization

### Alternatives Considered
- **Context API**: Rejected due to performance concerns with PDF rendering
- **MUI/Chakra UI**: Rejected in favor of Shadcn/UI for better Tailwind integration
- **OpenAI Vision API**: Rejected due to coordinate imprecision and potential hallucination

## Plan 2: TypeScript Types, Zod Schemas, and Zustand Store (April 17, 2026)

### Type System Design
- **Strict Zod validation**: All external data (especially Azure AI responses) validated before use
- **Normalized coordinate system**: 0-1 scale for resolution independence across devices
- **Utility type helpers**: FieldType, FieldValue, PixelRect for better developer experience
- **Immutable state updates**: Zustand store uses immutable patterns for React compatibility

### Zustand Store Architecture
- **Selective subscriptions**: Documented pattern to prevent unnecessary re-renders
- **Single source of truth**: All PDF and form state centralized in one store
- **Immutable updates**: Using spread operators and map functions for state updates
- **Clear action separation**: State and actions clearly separated in store interface

### Coordinate Transformation Strategy
- **Azure polygon to normalized rect**: Converts 8-point polygons to simple rectangles
- **Error handling**: Input validation for polygon format and page dimensions
- **Clamping**: Ensures coordinates stay within 0-1 bounds
- **Bidirectional conversion**: Support for both normalized-to-pixel and pixel-to-normalized

### Validation Approach
- **Runtime validation**: Zod schemas validate data at runtime, not just compile time
- **Structured error messages**: Field-specific validation messages for better UX
- **Composition**: Smaller schemas composed into larger ones for maintainability

### Alternatives Considered
- **Redux Toolkit**: Rejected due to boilerplate overhead for this use case
- **React Query + Context**: Rejected as it doesn't solve the cross-panel sync requirement
- **Manual coordinate tracking**: Rejected in favor of normalized system for scalability

## Plan 3: Azure AI Document Intelligence Integration (April 17, 2026)

### Azure Service Selection
- **Azure AI Document Intelligence over OpenAI GPT-4 Vision**: Specialized IDP service with deterministic field extraction and precise coordinates
- **prebuilt-layout model**: Provides keyValuePairs feature for form field detection without custom model training
- **REST client over SDK**: @azure-rest/ai-document-intelligence provides better control over requests and responses

### API Architecture Decisions
- **Server-only processing**: Azure credentials and processing remain server-side for security
- **POST /api/analyze endpoint**: RESTful design with proper HTTP status codes
- **FormData file upload**: Standard multipart/form-data for file transmission
- **ArrayBuffer conversion**: Required format for Azure API calls

### Field Processing Strategy
- **Intelligent type inference**: Automatic detection of text/number/checkbox fields based on content patterns
- **Value conversion**: String values converted to appropriate JavaScript types (boolean, number, string)
- **Confidence tracking**: Azure confidence scores preserved for user visibility
- **Selective processing**: Skip empty or malformed fields with warning logs

### Error Handling Design
- **Layered error handling**: API route -> Azure service -> individual field processing
- **Specific error types**: Different HTTP status codes for different failure modes
- **User-friendly messages**: Technical errors translated to actionable user messages
- **Fallback processing**: Continue processing other fields if individual fields fail

### Polling Strategy
- **2-second intervals**: Balance between responsiveness and API rate limits
- **60-second timeout**: Maximum wait time with 30 attempts
- **Status checking**: Proper handling of Azure's asynchronous analysis API
- **Early termination**: Stop polling on success or failure states

### Security Considerations
- **Environment variable validation**: Fail fast if Azure credentials missing
- **File validation**: Type, size, and content validation before processing
- **No credential exposure**: Azure keys never sent to client
- **Error message sanitization**: No sensitive information in error responses

### Alternatives Considered
- **OpenAI GPT-4 Vision**: Rejected due to coordinate imprecision and hallucination risks
- **AWS Textract**: Rejected in favor of Azure for better form-specific features
- **Direct PDF parsing libraries**: Rejected due to complexity of OCR and layout detection
- **Synchronous processing**: Rejected due to Azure's asynchronous API design
- **Client-side processing**: Rejected for security and capability limitations

## Plan 4: PDF Viewer Component (Left Panel) (April 17, 2026)

### PDF Rendering Library Selection
- **react-pdf over PDF.js directly**: Provides React-friendly API while maintaining full PDF.js capabilities
- **Client-side rendering**: PDF processing happens in browser for responsive interaction
- **Worker configuration**: PDF.js worker configured at module level for optimal performance

### Coordinate System Implementation
- **Percentage-based positioning**: Overlays use CSS percentages for resolution independence
- **Normalized coordinates**: 0-1 scale coordinates converted to 100% CSS values
- **Responsive design**: ResizeObserver ensures proper scaling across screen sizes
- **Point-to-inch conversion**: PDF dimensions converted from points (72 points = 1 inch)

### Multi-page Architecture
- **Single scroll container**: All pages rendered in one scrollable area for smooth navigation
- **Individual page containers**: Each page wrapped in relative positioned container for overlay positioning
- **Page-based field filtering**: Fields filtered by page number for optimal rendering performance
- **Navigation controls**: Previous/next buttons plus jump-to-page input for large documents

### Synchronization Strategy
- **Bidirectional sync**: Form-to-PDF (scroll) and PDF-to-Form (click) synchronization
- **Custom hook pattern**: usePdfScrollSync encapsulates auto-scroll logic
- **Smooth scrolling**: scrollIntoView with 'smooth' behavior and 'center' block positioning
- **Timeout-based delays**: 100ms delay ensures DOM updates before scrolling

### Animation and Visual Feedback
- **Framer Motion integration**: Smooth animations for active state transitions
- **Pulse animations**: Subtle pulse effect on scroll-to-field for visual feedback
- **Hover states**: Interactive feedback on overlay hover
- **Development aids**: Field labels with confidence scores in development mode

### Performance Optimizations
- **Selective subscriptions**: Components only subscribe to specific Zustand state slices
- **Field filtering**: Only render overlays for fields on current page
- **ResizeObserver**: Efficient responsive updates without polling
- **Layout animations**: Framer Motion layoutId for smooth position changes

### Accessibility Features
- **Keyboard navigation**: Enter/Space key support for overlay activation
- **ARIA labels**: Proper labeling for screen readers
- **Focus management**: Tab navigation through overlays
- **Role attributes**: Button role for interactive overlays

### Alternatives Considered
- **PDF-lib for rendering**: Rejected due to limited interactive features
- **Native canvas rendering**: Rejected for complexity of text/annotation layers
- **Intersection Observer for sync**: Rejected in favor of direct scrollIntoView approach
- **Virtual scrolling**: Not needed for typical form document sizes
- **Image-based PDF display**: Rejected due to poor zoom/quality characteristics

## Plan 5: Dynamic Form Component (Right Panel) (April 17, 2026)

### Form Library Selection
- **react-hook-form over Formik**: Better performance, smaller bundle size, and excellent TypeScript support
- **Zod for validation**: Runtime type safety and seamless integration with react-hook-form via zodResolver
- **Dynamic schema generation**: Build validation rules based on extracted PDF fields at runtime

### Form Architecture Design
- **FormProvider pattern**: Enables nested components to access form context without prop drilling
- **Selective Zustand integration**: Form state in react-hook-form, cross-component state in Zustand
- **Watch subscription**: Real-time sync of form changes back to Zustand store
- **Mode: onChange**: Immediate validation feedback for better user experience

### Field Type Implementation
- **Text fields**: String validation with min/max length constraints
- **Number fields**: Transform pipeline (string → cleaned → number) with currency symbol handling
- **Checkbox fields**: Boolean state with visual feedback and auto-clear active state
- **Extensible design**: Easy addition of date, select, textarea field types

### Synchronization Strategy
- **Form → PDF**: onFocus/onBlur handlers update activeFieldId in Zustand
- **PDF → Form**: useEffect responds to activeFieldId changes with scrollIntoView
- **Checkbox special handling**: Auto-clear active field after 1 second for better UX
- **Smooth scrolling**: 'center' block positioning for optimal field visibility

### Validation Approach
- **Dynamic Zod schemas**: Generated at runtime based on PDF field extraction results
- **Field-specific rules**: Custom validation messages including field labels
- **Transform validation**: Handle currency formats and string-to-number conversion
- **Real-time feedback**: onChange mode provides immediate validation results

### Visual Design System
- **Active field highlighting**: Pulsing border animation with Framer Motion
- **Confidence indicators**: AI extraction confidence shown as percentage badges
- **Page grouping**: Multi-page forms organized with clear section headers
- **Error display**: Accessible error messages with ARIA attributes

### Performance Optimizations
- **Memoized schemas**: Prevent unnecessary Zod schema rebuilds
- **Selective subscriptions**: Only subscribe to specific Zustand state slices
- **Field sorting**: Organize fields by vertical position within pages
- **Efficient re-renders**: FormProvider pattern minimizes component updates

### Accessibility Features
- **ARIA attributes**: Proper labeling and error associations
- **Focus management**: Automatic scrolling to active fields
- **High contrast**: Clear visual indicators for active and error states
- **Screen reader support**: Descriptive labels and error messages

### User Experience Enhancements
- **Smart defaults**: Preserve AI-extracted values as form defaults
- **Reset functionality**: Restore original AI-extracted values
- **Progress indicators**: Field count and confidence score display
- **Contextual help**: Instructions and low-confidence warnings

### Alternatives Considered
- **Formik**: Rejected due to larger bundle size and more complex API
- **React Final Form**: Rejected for less TypeScript support
- **Manual form state**: Rejected due to complexity of validation and error handling
- **Single field validation**: Rejected in favor of unified schema approach
- **Controlled components only**: Rejected for performance reasons with large forms

## Plan 6: Layout, File Upload, and Page Assembly (April 17, 2026)

### Layout Architecture Design
- **Responsive-first approach**: Mobile breakpoint at 1024px for adequate panel space
- **Mobile strategy**: Tabs component for switching between PDF and Form views
- **Desktop strategy**: Side-by-side 50/50 split with flexible grid layout
- **Dynamic breakpoint detection**: Window resize listener with state management

### State-Driven UI Pattern
- **Application states**: upload, analyzing, error, no-fields, dashboard
- **Conditional rendering**: Different panel content based on Zustand store state
- **Centralized state logic**: Single function determines app state from store values
- **Graceful transitions**: Loading states and error recovery actions

### File Upload Implementation
- **Drag-and-drop interface**: HTML5 drag events with visual feedback
- **File validation layer**: Type checking (PDF only), size limits (10MB), emptiness validation
- **Progress tracking**: Multi-stage progress updates during analysis pipeline
- **Dual variants**: Full upload UI for initial state, compact retry button for errors

### Error Handling Strategy
- **Toast notification system**: Success/error feedback with Sonner integration
- **Contextual error display**: In-panel error messages with recovery actions
- **Validation feedback**: Immediate file validation with descriptive error messages
- **Recovery workflows**: Retry upload functionality with state reset

### Component Integration Approach
- **Dynamic imports**: Client-side loading to avoid SSR issues with react-pdf
- **Selective subscriptions**: Performance-optimized Zustand store access
- **Loading skeletons**: Realistic loading states matching final UI structure
- **Toast integration**: Centralized notification system for user feedback

### Performance Optimizations
- **Lazy component loading**: Dynamic imports with loading fallbacks
- **Selective re-rendering**: Component-level Zustand subscriptions
- **Efficient breakpoint detection**: Event-based responsive updates
- **File object management**: Proper URL cleanup and memory management

### User Experience Design
- **Progressive disclosure**: Show relevant UI based on current application state
- **Visual feedback systems**: Animations, progress bars, loading states
- **Responsive information hierarchy**: Important info visible on all screen sizes
- **Accessibility considerations**: ARIA labels, keyboard navigation, screen reader support

### Integration Architecture
- **Zustand store integration**: Central state management for cross-component communication
- **React-pdf compatibility**: SSR-safe loading with dynamic imports
- **Toast system integration**: Consistent notification patterns
- **Component composition**: Clean separation between layout, content, and business logic

### Alternatives Considered
- **CSS Grid vs Flexbox**: Chose Flexbox for better browser compatibility and simpler responsive logic
- **React Query for uploads**: Rejected in favor of direct fetch for simpler error handling
- **Fixed breakpoints**: Rejected in favor of dynamic window resize detection
- **Server-side rendering**: Disabled due to react-pdf DOM dependencies
- **Context API for state**: Rejected in favor of existing Zustand architecture
- **Compound component pattern**: Rejected for simpler prop-based composition

## Plan 7: Polish, Animations, and Responsive Design

**Status**: Completed ✅  
**Date**: 2026-04-17

### Animation System Architecture
- **Decision**: Centralized animation configuration in `lib/animations/index.ts`
- **Alternative**: Component-specific animation definitions
- **Rationale**: Ensures consistency across the application, easier maintenance, and better performance with reusable animation variants

### Framer Motion Integration
- **Decision**: Enhanced existing animations with standardized timing, easing, and variants
- **Alternative**: Replace all animations with new implementations
- **Rationale**: Maintains existing functionality while improving visual quality and consistency

### Performance Optimization
- **Decision**: Debounced resize handlers and selective animation triggers
- **Alternative**: Direct event handlers without optimization
- **Rationale**: Prevents performance issues during window resizing and rapid interactions

### Accessibility Enhancements
- **Decision**: Dedicated accessibility utility module with focus management, screen reader support, and keyboard navigation
- **Alternative**: Basic accessibility attributes
- **Rationale**: Ensures application is usable by all users, including those with disabilities

### Component Architecture Improvements
- **Decision**: Refactored component creation to avoid render-time component definitions
- **Alternative**: Keep existing inline component definitions
- **Rationale**: Prevents React performance warnings and potential state reset issues

### Animation Categories Implemented
- **Layout Transitions**: Smooth panel resizing and repositioning
- **State Changes**: Visual feedback for loading, success, and error states  
- **User Interactions**: Button taps, hovers, and focus states
- **Content Reveals**: Staggered animations for lists and sections
- **Micro-interactions**: Field highlighting, progress indicators, and status changes

### Alternatives Considered
- **CSS animations vs Framer Motion**: Chose Framer Motion for better React integration and declarative API
- **Individual animation files**: Rejected in favor of centralized configuration
- **Reduced motion detection**: Added as utility function for accessibility compliance
- **Global animation disable**: Rejected in favor of respecting user motion preferences
- **Animation on every interaction**: Selective animation triggers to avoid overwhelming users

## Processing Engine Selection Enhancement (April 18, 2026)

### User Choice Implementation
- **Decision**: Two-engine architecture with runtime selection between Azure Document Intelligence and Pure LLM (Gemini)
- **Alternative**: Single fixed processing engine
- **Rationale**: Allows users to compare approaches and choose optimal results for their specific documents

### Processing Mode Architecture
- **Decision**: `processingMode` parameter in API with server-side conditional routing
- **Alternative**: Separate API endpoints for each engine
- **Rationale**: Maintains single upload interface while providing engine flexibility

### Engine Positioning Strategy
- **Decision**: Azure Document Intelligence as default, LLM as experimental option
- **Alternative**: Equal positioning of both engines
- **Rationale**: Azure provides production-grade reliability while LLM offers experimental semantic improvements

### UI/UX Design Decisions
- **Decision**: Header-based dropdown selector with descriptive labels and icons
- **Alternative**: Settings page or separate workflow for engine selection
- **Rationale**: Immediate visibility and easy switching without workflow disruption

### State Management Integration
- **Decision**: ProcessingMode as part of Zustand store with persistence
- **Alternative**: Local component state or URL parameters
- **Rationale**: Consistent state management pattern with session persistence

### Code Quality Improvements
- **Decision**: Complete removal of temporary/testing code and sample data
- **Alternative**: Keep commented code for reference
- **Rationale**: Production readiness requires clean, maintainable code without development artifacts

### Engine Comparison Benefits
- **Azure strengths**: Precise coordinates, deterministic results, enterprise reliability
- **LLM strengths**: Better semantic understanding, improved field grouping, contextual intelligence
- **User benefit**: Can test both approaches to find optimal results for their specific document types