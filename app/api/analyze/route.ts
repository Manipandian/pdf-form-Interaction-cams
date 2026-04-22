import { NextRequest } from "next/server";
import { analyzeDocument, analyzeLLMDocument } from "@/lib/azure";
import { getFileValidationStatus } from "@/lib/validations";
import type { ProcessingMode } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file");
    const processingModeRaw = formData.get("processingMode");

    // Type-safe validation
    if (!file || !(file instanceof File)) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate and sanitize processing mode
    const processingMode: ProcessingMode = 
      (processingModeRaw === "llm" || processingModeRaw === "azure") 
        ? processingModeRaw 
        : "azure";

    const { error, status } = getFileValidationStatus(file);
    if (error) {
      return Response.json({ error }, { status });
    }

    // Convert file to ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Choose processing approach based on user selection
    const result = processingMode === "llm" 
      ? await analyzeLLMDocument(buffer)
      : await analyzeDocument(buffer);

    return Response.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Expires': '0'
      }
    });

  } catch (error) {
    // Log detailed error server-side only
    console.error("Document analysis failed:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    // Return sanitized error message to client
    if (error instanceof Error && (error.message.includes('Azure') || error.message.includes('Gemini') || error.message.includes('Service Unavailable'))) {
      return Response.json(
        { error: "Document processing service is temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    if (error instanceof Error && error.message.includes('timeout')) {
      return Response.json(
        { error: "Document analysis timed out. Please try with a smaller document." },
        { status: 408 }
      );
    }

    // Generic error response - no sensitive information leaked
    return Response.json(
      { error: "Document analysis failed. Please check your file and try again." },
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