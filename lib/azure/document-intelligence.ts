import "server-only";

import DocumentIntelligence, { 
  AnalyzeOperationOutput, 
  getLongRunningPoller, 
  isUnexpected 
} from "@azure-rest/ai-document-intelligence";
import { generateFieldId } from "@/lib/utils";
import { polygonToNormalizedRect } from "@/lib/utils/coordinate-utils";
import { analysisResultSchema } from "@/lib/validations";
import type { AnalysisResult, PDFField, FieldType } from "@/lib/types";

/**
 * Initialize Azure AI Document Intelligence client
 */
function createClient() {
  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

  if (!endpoint || !key) {
    throw new Error(
      "Missing Azure AI Document Intelligence configuration. Please set AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT and AZURE_DOCUMENT_INTELLIGENCE_KEY environment variables."
    );
  }

  return DocumentIntelligence(endpoint, { key });
}

/**
 * Infer field type from the extracted value
 */
function inferFieldType(value: string): FieldType {
  const normalizedValue = value.toLowerCase().trim();
  
  // Check for checkbox indicators
  if (
    normalizedValue === "selected" ||
    normalizedValue === "unselected" ||
    normalizedValue === "checked" ||
    normalizedValue === "unchecked" ||
    normalizedValue === ":selected:" ||
    normalizedValue === ":unselected:" ||
    normalizedValue === "☑" ||
    normalizedValue === "☐" ||
    normalizedValue === "✓" ||
    normalizedValue === "✗"
  ) {
    return "checkbox";
  }

  // Check for number patterns (integers, decimals, currency)
  const numberPattern = /^-?\d*\.?\d+$|^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/;
  if (numberPattern.test(normalizedValue)) {
    return "number";
  }

  // Default to text
  return "text";
}

/**
 * Convert value string to appropriate JavaScript type based on field type
 */
function convertValue(value: string, type: FieldType): string | number | boolean {
  switch (type) {
    case "checkbox": {
      const normalizedValue = value.toLowerCase().trim();
      return (
        normalizedValue === "selected" ||
        normalizedValue === "checked" ||
        normalizedValue === ":selected:" ||
        normalizedValue === "☑" ||
        normalizedValue === "✓"
      );
    }
    case "number": {
      // Remove currency symbols and commas
      const cleanValue = value.replace(/[$,]/g, "");
      const parsed = parseFloat(cleanValue);
      return isNaN(parsed) ? 0 : parsed;
    }
    case "text":
    default:
      return value;
  }
}

/**
 * Analyze document using Azure AI Document Intelligence
 */
export async function analyzeDocument(fileBuffer: ArrayBuffer): Promise<AnalysisResult> {
  try {
    const client = createClient();
    
    // Convert ArrayBuffer to base64
    const uint8Array = new Uint8Array(fileBuffer);
    const base64String = Buffer.from(uint8Array).toString('base64');

    // Start the analysis using Azure SDK's recommended approach
    const initialResponse = await client.path("/documentModels/{modelId}:analyze", "prebuilt-layout").post({
      contentType: "application/json",
      body: {
        base64Source: base64String
      },
      queryParameters: {
        features: ["keyValuePairs"]
      }
    });
    
    console.log("Initial response from Azure Document Intelligence:", {
      status: initialResponse.status,
      headers: initialResponse.headers
    });

    // Check for unexpected response
    if (isUnexpected(initialResponse)) {
      throw new Error(`Analysis failed: ${initialResponse.body?.error?.message || "Unknown error"}`);
    }

    // Use Azure SDK's long running poller (recommended approach)
    console.log("Creating long running poller...");
    const poller = getLongRunningPoller(client, initialResponse);
    
    console.log("Polling until done...");
    const pollerResult = await poller.pollUntilDone();
    
    console.log("Polling completed successfully");
    const result: AnalyzeOperationOutput = pollerResult.body as AnalyzeOperationOutput;

    // Log the result structure for debugging
    console.log("Analysis result structure:", {
      status: result.status,
      hasAnalyzeResult: !!result.analyzeResult,
      pages: result.analyzeResult?.pages?.length || 0,
      keyValuePairs: result.analyzeResult?.keyValuePairs?.length || 0
    });

    // Extract pages for dimensions
    const pages = result.analyzeResult?.pages || [];
    if (pages.length === 0) {
      throw new Error("No pages found in document");
    }

    const firstPage = pages[0];
    const pageWidth = firstPage.width || 8.5; // Default to letter size
    const pageHeight = firstPage.height || 11;
    const pageCount = pages.length;

    // Extract key-value pairs
    const keyValuePairs = result.analyzeResult?.keyValuePairs || [];
    const fields: PDFField[] = [];

    for (const pair of keyValuePairs) {
      try {
        // Skip if missing essential data
        if (!pair.key?.content || !pair.value?.content) {
          continue;
        }

        const label = pair.key.content.trim();
        const valueContent = pair.value.content.trim();
        
        // Skip empty values
        if (!valueContent) {
          continue;
        }

        // Determine field type and convert value
        const fieldType = inferFieldType(valueContent);
        const convertedValue = convertValue(valueContent, fieldType);

        // Get bounding region (prefer value region, fallback to key region)
        const boundingRegion = pair.value.boundingRegions?.[0] || pair.key.boundingRegions?.[0];
        
        if (!boundingRegion || !boundingRegion.polygon) {
          continue; // Skip fields without location data
        }

        const pageNumber = boundingRegion.pageNumber || 1;
        const polygon = boundingRegion.polygon;

        // Convert polygon to normalized rectangle
        const normalizedRect = polygonToNormalizedRect(polygon, pageWidth, pageHeight);

        // Create PDF field
        const field: PDFField = {
          id: generateFieldId(),
          label,
          value: convertedValue,
          type: fieldType,
          page: pageNumber,
          confidence: pair.confidence || 0.5,
          normalizedRect,
        };

        fields.push(field);
      } catch (error) {
        console.warn(`Skipping field due to error:`, error);
        // Continue processing other fields
      }
    }

    // Create the result object
    const analysisResult: AnalysisResult = {
      fields,
      pageCount,
      pageWidth,
      pageHeight,
    };

    // Validate the result with Zod
    const validatedResult = analysisResultSchema.parse(analysisResult);
    
    return validatedResult;

  } catch (error) {
    console.error("Azure AI Document Intelligence analysis failed:", error);
    
    if (error instanceof Error) {
      throw new Error(`Document analysis failed: ${error.message}`);
    }
    
    throw new Error("Document analysis failed with unknown error");
  }
}