<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI PDF Form Interaction Project

## Project Overview
This project uses Next.js 16.2.4 (App Router, Turbopack default, async Request APIs) to build an AI-powered PDF form interaction tool.

## Technology Stack
- **Framework**: Next.js 16.2.4 (App Router)
- **State Management**: Zustand (not React Context)
- **PDF Rendering**: react-pdf (client-side only)
- **AI Integration**: Azure AI Document Intelligence (server-side API routes only)
- **Form Management**: react-hook-form + Zod validation
- **Animations**: Framer Motion
- **UI Library**: Shadcn/UI + Tailwind CSS v4
- **TypeScript**: Strict mode enabled

## Key Conventions
- No `tailwind.config.ts` - Tailwind v4 uses `@theme inline` in `globals.css`
- Use Zustand selectors to prevent unnecessary re-renders
- Azure SDK calls happen ONLY in API routes (server-side)
- PDF viewer components are client components with `'use client'`
- All coordinate transformations use normalized 0-1 scale
- Environment variables for Azure keys are server-side only

## Architecture
- Left Panel: PDF viewer with bounding box overlays
- Right Panel: Dynamic form generated from AI field extraction
- Bidirectional sync: form focus triggers PDF highlight, PDF click triggers form scroll
- State management through Zustand store as single source of truth