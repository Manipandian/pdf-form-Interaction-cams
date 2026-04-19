import { NextRequest } from "next/server";
import { analyzeDocument } from "@/lib/azure/document-intelligence";

// File size limit (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Supported MIME types
const SUPPORTED_TYPES = ["application/pdf"];

const tempSampleResult = {"fields":[{"id":"91196703-3c90-4e45-926d-a1f1b930c195","label":"Post Office","value":"Delhi GPO","type":"text","page":1,"confidence":0.993,"normalizedRect":{"top":0.1936886803760081,"left":0.21345454545454545,"width":0.1538666666666667,"height":0.02272143554269473}},{"id":"0c79f73a-c91d-463e-8387-692a8df1c76f","label":"*CIF ID","value":321502150,"type":"number","page":1,"confidence":0.996,"normalizedRect":{"top":0.21809667311610703,"left":0.18238787878787877,"width":0.2927393939393939,"height":0.025871958632262042}},{"id":"11cf3101-bad7-416e-88e3-5e2025fce707","label":"Primary Account ID","value":4458312548,"type":"number","page":1,"confidence":0.997,"normalizedRect":{"top":0.21880725305206924,"left":0.5779030303030303,"width":0.32116363636363643,"height":0.025332602777254597}},{"id":"6a91565f-7ac5-4a1c-a1a7-ac295d0366f2","label":"First Name","value":"TOFUTUUIS","type":"text","page":1,"confidence":0.92,"normalizedRect":{"top":0.2419738712052463,"left":0.3485939393939394,"width":0.2896484848484849,"height":0.03728404362789581}},{"id":"6a925ead-7b53-46d4-8bb5-043089a711d1","label":"Middle Name","value":"RJKultheep 8","type":"text","page":1,"confidence":0.915,"normalizedRect":{"top":0.2826995188603325,"left":0.2825818181818182,"width":0.35231515151515147,"height":0.021325959282913576}},{"id":"5cdff9e2-479a-46a7-aa94-fb911fd5ca62","label":"(a) Self","value":true,"type":"checkbox","page":1,"confidence":0.992,"normalizedRect":{"top":0.37083711453178775,"left":0.2795515151515151,"width":0.05333333333333338,"height":0.028671472355872148}},{"id":"0d4b4a5b-4d05-4d5d-94dd-29e376ef27d8","label":"Mobile Number","value":6378951260,"type":"number","page":1,"confidence":0.997,"normalizedRect":{"top":0.4378285362053319,"left":0.35770909090909087,"width":0.16859393939393938,"height":0.017738814786911656}},{"id":"b63d36c3-68c0-4ff6-ba7e-80e4645de9e2","label":"PAN Number","value":"FTF8512GM","type":"text","page":1,"confidence":0.997,"normalizedRect":{"top":0.4373063027584199,"left":0.713030303030303,"width":0.16459393939393938,"height":0.018286731845966856}},{"id":"207c58f3-8dba-41a9-8f7c-08b6fcb14911","label":"Email ID","value":"kultheepri@gmail.com","type":"text","page":1,"confidence":0.925,"normalizedRect":{"top":0.45705700049654985,"left":0.36167272727272726,"width":0.26287272727272726,"height":0.017696008766672915}},{"id":"fd4a31c1-b81c-415e-b7bf-2587cfc97152","label":"Date of Birth(DD-MM-YYYY)","value":"06/03/1976","type":"text","page":1,"confidence":0.989,"normalizedRect":{"top":0.4765251785011044,"left":0.35973333333333335,"width":0.15273939393939395,"height":0.017208020135951962}},{"id":"981d27c6-0b74-48cf-b5df-38544ff0b260","label":"Mother's Maiden Name","value":"Rejina","type":"text","page":1,"confidence":0.982,"normalizedRect":{"top":0.4771073403763505,"left":0.7093333333333334,"width":0.08134545454545455,"height":0.01673715391332637}},{"id":"26af9eeb-44c5-4dd2-811c-63baf2478370","label":"Request type","value":"a. Instant ATM Card\nATM card (or) Replaced Personalized ATM card b.\nto\nC.\nd.\nfor","type":"text","page":1,"confidence":0.898,"normalizedRect":{"top":0.5765970926151054,"left":0.15003636363636363,"width":0.4994060606060606,"height":0.17140386623974793}},{"id":"198b0330-eb7d-4b03-8f68-824cdc80d77c","label":"Provide SB Account IDs to be linked","value":true,"type":"checkbox","page":1,"confidence":0.969,"normalizedRect":{"top":0.76348817697721,"left":0.7466181818181818,"width":0.06823030303030303,"height":0.03892779480506145}}],"pageCount":1,"pageWidth":8.25,"pageHeight":11.6806}

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file");

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

    // Analyze document with Azure AI
    // const result = await analyzeDocument(buffer);
    const result = await Promise.resolve(tempSampleResult);
    console.log("result of azure document intelligence post request", JSON.stringify(result));
    // Log successful analysis (without sensitive data)
    console.log(`Successfully analyzed PDF: ${file.name}, found ${result.fields.length} fields`);

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




 