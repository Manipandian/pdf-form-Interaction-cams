import { NextRequest } from "next/server";
import { analyzeDocument, analyzeLLMDocument } from "@/lib/azure";
import { getFileValidationStatus } from "@/lib/validations";


export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const processingMode = formData.get("processingMode") as string || "azure";

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
    // const result: AnalysisResult = await new Promise((resolve) => setTimeout(() => resolve(tempResult as AnalysisResult), 3000));

    return Response.json(result, {
      headers: {
        'Cache-Control': 'no-store', // Don't cache analysis results
      }
    });

  } catch (error) {
    console.error("API route error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Generic error with message
      return Response.json(
        { error: `${error.message}` },
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



// const tempResult = {"fields":[{"id":"field-1","label":"Post Office","value":"Delhi GPO","type":"text","page":1,"confidence":0.95,"normalizedRect":{"top":0.198,"left":0.278,"width":0.16,"height":0.024}},{"id":"field-2","label":"Date","value":"01/08/19","type":"text","page":1,"confidence":0.95,"normalizedRect":{"top":0.198,"left":0.697,"width":0.196,"height":0.025}},{"id":"field-3","label":"CIF ID","value":321502150,"type":"number","page":1,"confidence":0.95,"normalizedRect":{"top":0.228,"left":0.21,"width":0.297,"height":0.025}},{"id":"field-4","label":"Primary Account ID","value":4458312548,"type":"number","page":1,"confidence":0.95,"normalizedRect":{"top":0.227,"left":0.536,"width":0.357,"height":0.025}},{"id":"field-5","label":"Applicant's First Name","value":"R J Kultheep","type":"text","page":1,"confidence":0.95,"normalizedRect":{"top":0.287,"left":0.28,"width":0.612,"height":0.024}},{"id":"field-6","label":"Applicant's Middle Name","value":"","type":"text","page":1,"confidence":0.9,"normalizedRect":{"top":0.315,"left":0.28,"width":0.612,"height":0.024}},{"id":"field-7","label":"Applicant's Last Name","value":"","type":"text","page":1,"confidence":0.9,"normalizedRect":{"top":0.344,"left":0.28,"width":0.612,"height":0.024}},{"id":"field-8","label":"ATM Card required for","value":true,"type":"checkbox","page":1,"confidence":0.95,"normalizedRect":{"top":0.38,"left":0.362,"width":0.026,"height":0.016}},{"id":"field-9","label":"Mobile Number","value":6378951260,"type":"number","page":1,"confidence":0.95,"normalizedRect":{"top":0.435,"left":0.345,"width":0.231,"height":0.024}},{"id":"field-10","label":"PAN Number","value":"FTF8512GM","type":"text","page":1,"confidence":0.95,"normalizedRect":{"top":0.435,"left":0.697,"width":0.198,"height":0.024}},{"id":"field-11","label":"Email ID","value":"kultheeprj@gmail.com","type":"text","page":1,"confidence":0.95,"normalizedRect":{"top":0.463,"left":0.345,"width":0.55,"height":0.024}},{"id":"field-12","label":"Date of Birth(DD-MM-YYYY)","value":"06/03/1976","type":"text","page":1,"confidence":0.95,"normalizedRect":{"top":0.49,"left":0.345,"width":0.231,"height":0.025}},{"id":"field-13","label":"Mother's Maiden Name","value":"Rojina","type":"text","page":1,"confidence":0.95,"normalizedRect":{"top":0.491,"left":0.697,"width":0.198,"height":0.025}},{"id":"field-14","label":"4.a. Instant ATM Card","value":false,"type":"checkbox","page":1,"confidence":0.95,"normalizedRect":{"top":0.573,"left":0.814,"width":0.019,"height":0.014}},{"id":"field-15","label":"4.b. New Personalized ATM card (or) Replaced Personalized ATM card - Request Type","value":true,"type":"checkbox","page":1,"confidence":0.95,"normalizedRect":{"top":0.627,"left":0.814,"width":0.02,"height":0.015}},{"id":"field-16","label":"4.b. Name to be printed on the card","value":"","type":"text","page":1,"confidence":0.9,"normalizedRect":{"top":0.655,"left":0.314,"width":0.462,"height":0.024}},{"id":"field-17","label":"4.c. Replacement with Instant ATM card","value":false,"type":"checkbox","page":1,"confidence":0.95,"normalizedRect":{"top":0.686,"left":0.814,"width":0.019,"height":0.014}},{"id":"field-18","label":"4.d. ATM card PIN request","value":false,"type":"checkbox","page":1,"confidence":0.95,"normalizedRect":{"top":0.716,"left":0.814,"width":0.019,"height":0.014}},{"id":"field-19","label":"4.e. ATM card hot-listing/ closure request","value":false,"type":"checkbox","page":1,"confidence":0.95,"normalizedRect":{"top":0.751,"left":0.814,"width":0.019,"height":0.014}},{"id":"field-20","label":"4.f. Internet Banking and Mobile Banking","value":true,"type":"checkbox","page":1,"confidence":0.95,"normalizedRect":{"top":0.789,"left":0.813,"width":0.027,"height":0.017}},{"id":"field-21","label":"4.g. Internet Banking","value":false,"type":"checkbox","page":1,"confidence":0.95,"normalizedRect":{"top":0.819,"left":0.814,"width":0.019,"height":0.014}},{"id":"field-22","label":"4.h. SMS Banking","value":false,"type":"checkbox","page":1,"confidence":0.95,"normalizedRect":{"top":0.849,"left":0.814,"width":0.019,"height":0.014}},{"id":"field-23","label":"4.i. Linking of Secondary accounts existing active ATM card","value":false,"type":"checkbox","page":1,"confidence":0.95,"normalizedRect":{"top":0.876,"left":0.814,"width":0.019,"height":0.014}},{"id":"field-24","label":"4.i. Provide SB Account IDs to be linked - 1","value":0,"type":"number","page":1,"confidence":0.9,"normalizedRect":{"top":0.88,"left":0.601,"width":0.177,"height":0.015}},{"id":"field-25","label":"4.i. Provide SB Account IDs to be linked - 2","value":0,"type":"number","page":1,"confidence":0.9,"normalizedRect":{"top":0.898,"left":0.601,"width":0.177,"height":0.015}}],"pageCount":1,"pageWidth":8.5,"pageHeight":11};