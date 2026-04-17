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