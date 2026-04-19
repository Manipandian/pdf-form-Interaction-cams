import { NextRequest } from "next/server";
import { analyzeDocument, analyzeLLMDocument } from "@/lib/azure";

// File size limit (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Supported MIME types
const SUPPORTED_TYPES = ["application/pdf"];


export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file");
    const processingMode = formData.get("processingMode") as string || "azure";

    // Validate file exists
    if (!file || !(file instanceof File)) {
      return Response.json(
        { error: "No file provided. Please upload a PDF file." },
        { status: 400 }
      );
    }

    // Validate file type
    if (!SUPPORTED_TYPES.includes(file.type)) {
      return Response.json(
        { 
          error: `Invalid file type. Only PDF files are supported. Received: ${file.type}` 
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = Math.round(file.size / (1024 * 1024) * 100) / 100;
      return Response.json(
        { 
          error: `File size (${sizeMB}MB) exceeds the 10MB limit. Please upload a smaller file.` 
        },
        { status: 400 }
      );
    }

    // Validate file is not empty
    if (file.size === 0) {
      return Response.json(
        { error: "Empty file provided. Please upload a valid PDF file." },
        { status: 400 }
      );
    }

    // Convert file to ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Choose processing approach based on user selection
    const result = processingMode === "llm" 
      ? await analyzeLLMDocument(buffer)
      : await analyzeDocument(buffer);
    
    console.log("Document analysis completed:", {
      fileName: file.name,
      fieldsExtracted: result.fields.length,
      pages: result.pageCount,
      processingMode: processingMode === "llm" ? "Pure LLM (Gemini)" : "Azure Document Intelligence"
    });

    return Response.json(result, {
      headers: {
        'Cache-Control': 'no-store', // Don't cache analysis results
      }
    });

  } catch (error) {
    console.error("API route error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("Missing Azure")) {
        return Response.json(
          { error: "Service configuration error. Please try again later." },
          { status: 503 }
        );
      }

      if (error.message.includes("timed out")) {
        return Response.json(
          { error: "Document analysis timed out. Please try again or use a smaller file." },
          { status: 408 }
        );
      }

      if (error.message.includes("validation")) {
        return Response.json(
          { error: "Document analysis produced invalid results. Please try a different file." },
          { status: 422 }
        );
      }

      // Generic error with message
      return Response.json(
        { error: `Analysis failed: ${error.message}` },
        { status: 500 }
      );
    }

    // Unknown error
    return Response.json(
      { error: "An unexpected error occurred during document analysis." },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return Response.json(
    { error: "Method not allowed. Use POST to analyze documents." },
    { status: 405 }
  );
}

export async function PUT() {
  return Response.json(
    { error: "Method not allowed. Use POST to analyze documents." },
    { status: 405 }
  );
}

export async function DELETE() {
  return Response.json(
    { error: "Method not allowed. Use POST to analyze documents." },
    { status: 405 }
  );
}




 