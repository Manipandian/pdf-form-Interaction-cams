# AI PDF Form Interaction

A Next.js application that automatically extracts form fields from PDF documents using AI and provides an interactive editing interface with highlight in PDF viewer based on form field.

## Setup Instructions

### Prerequisites
- Node.js 18+
- Azure AI Document Intelligence service url and key
- Google Gemini API key (for LLM-based processing)

### Installation

1. **Clone and install dependencies**
```bash
git clone https://github.com/Manipandian/pdf-form-Interaction-cams.git

cd pdf-form-interaction
npm install
```

2. **Environment setup**
```bash
cp .env.example .env.local
```

### Environment Variables & Credentials Required

Add the following to your `.env.local` file:

```env
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_KEY=your-32-character-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

**Get Azure Credentials(Free with a limit of 500 request per month):**
- Create Azure AI Document Intelligence resource: [Azure Portal Guide](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/how-to-guides/use-sdk-rest-api?view=doc-intel-4.0.0&tabs=windows&pivots=programming-language-csharp#prerequisites)
- Copy endpoint and key from the resource overview page

**Get Gemini API Key (Free with rate limit):**
- Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
- Create new API key for Gemini models

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build
```bash
npm run build
npm start
```

## Features Added

### Core AI Processing
- **Dual AI Engine Support**: Choose between Azure Document Intelligence and Pure LLM (Gemini) processing
- **Intelligent Field Detection**: Automatic extraction of text, number and checkbox fields
                         **Note**: Azure Doc might give non form field in keyValue pair becaus of its freetier prebuild-layout model usage
- **Coordinate-Based Highlighting**: Field positioning with normalized coordinate system
                           **Note**: In LLM based analysis, Coornidates accuracy varies based on PDF quality
- **Confidence Scoring**: Real-time AI confidence metrics for extracted data quality

### Interactive Interface
- **PDF Synchronization**: Click form fields to highlight PDF
- **Dynamic Form Generation**: Auto-generates appropriate input controls based on detected field types
- **Real-time Validation**: Live form validation with Zod schemas and error handling

### User Experience
- **Drag-and-Drop Upload**: Intuitive file upload with progress tracking
- **Processing Mode Selection**: Header dropdown to switch between AI engines
- **Visual Feedback**: Loading states, animations, and success/error notifications
- **Type Safety**: Full TypeScript implementation with runtime validation

## Short Explanation of Approach

### High-Level System Design

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   File Upload   │───▶│  AI Processing  │───▶│  Form Editor    │
│                 │    │                 │    │                 │
│ • Drag & Drop   │    │ • Azure AI      │    │ • Dynamic Forms │
│ • Validation    │    │ • Gemini LLM    │    │ • PDF Sync      │
│ • Progress      │    │ • Coordinate    │    │ • Validation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Decisions

**Next.js 15 + App Router**: Chosen for server-side API security, optimal performance with server/client component separation.

**Zustand for State Management**: Selected over Redux for simpler API, better performance with selective subscriptions, and reduced boilerplate for form-heavy applications.

**Zod for Validation**: Implements runtime type checking, seamless TypeScript integration, and ensures data integrity between AI services and client application.

**Framer Motion**: Provides smooth animations and micro-interactions that enhance user experience without impacting performance.

**React-PDF**: Enables client-side PDF rendering with precise coordinate mapping for field highlighting accuracy.

### AI Document Analysis Engine

#### Azure Document Intelligence (Recommended for Production with custom model)
**Pros:**
- Provides pixel-accurate coordinate information for precise field positioning
- Enterprise-grade reliability with 99.9% uptime SLA
- Structured data extraction with confidence scores
- Supports complex document layouts and multi-page forms

**Cons:**
- Prebuilt-layout model that i am curretly using has limitations in detecting all field types accurately
- It blindly find all key value pairs irrespective of whether its a form field or not.
- Requires manual field type inference based on content patterns

**Production Enhancement**: Custom model training with specific form templates would significantly improve field detection accuracy and type classification.

#### LLM-Based Solution (Gemini)
**Pros:**
- Superior field type intelligence through contextual understanding
- Better handling of complex field relationships and grouped data
- Flexible prompt engineering for different document types
- Lower per-document processing costs

**Cons:**
- Coordinate accuracy depends on PDF quality and model capabilities
- Potential for hallucination in sensitive data extraction
- Less reliable for production-critical applications
- Requires careful prompt tuning for consistent results
- Since i am using a free tier version, service unavailablity happens if traffic is too high.

## State Management Strategy

### Zustand Store Architecture

The application uses a centralized Zustand store with selective subscriptions for optimal performance:

```
FormStore
├── PDF State (file, url, pages)
├── Field State (extracted data, validation)
├── UI State (active field, loading states)
└── Actions (field updates, synchronization)
```

### State Flow Design

1. **File Upload**: Immutable state updates with loading indicators
2. **AI Processing**: Batched field updates with confidence scoring
3. **Form Interaction**: Selective component re-rendering using Zustand selectors
4. **PDF Synchronization**: Event-driven field highlighting without full re-renders

### Data Flow Pattern

1. **Upload Stage**: File validation → Base64 encoding → Server-side API call
2. **Processing Stage**: AI service analysis → Coordinate normalization → Field type inference
3. **Rendering Stage**: PDF display → Form generation → Form sync with Active form field ID

### Why This Approach

- **Performance**: Only components subscribing to specific state slices re-render
- **Type Safety**: Full TypeScript integration with Zod validation
- **Scalability**: Easy to extend with additional AI engines or field types

## How You Would Handle Real AI-Based Field Extraction from Scanned Forms

For production-grade sensitive document processing (banking, healthcare, legal), LLM-based solutions introduce hallucination or data leak risks that are unacceptable for critical applications. There are some AI tools available in market that ae reliable and secure both with respect to field extraction accuracy and standard.

### Recommended Production Solutions

**Azure Document Intelligence with Custom Models**: Train custom models using your specific PDF form templates. This provides enterprise-grade accuracy with structured confidence scoring and maintains coordinate precision.

**Google Cloud Document AI**: Offers specialized processors for financial documents, forms, and invoices with pre-trained models for banking use cases.

**AWS Textract**: Provides robust table detection and key-value pair extraction with built-in compliance features for regulated industries.

### Alternative Specialized Tools

- **ABBYY FlexiCapture**: Enterprise document processing with advanced template-based extraction
- **Kofax TotalAgility**: End-to-end document workflow automation
- **OpenText Capture**: High-volume document processing with machine learning capabilities

All production solutions provide structured API responses with standardized key-value pairs, making them suitable for enterprise integration with existing document management systems.