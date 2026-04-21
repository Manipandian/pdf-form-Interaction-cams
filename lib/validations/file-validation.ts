// File size limit (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Supported MIME types
const SUPPORTED_TYPES = ["application/pdf"];

export function getFileValidationStatus(file: File): { error: string | null, status: number } {

    // Validate file exists
    if (!file || !(file instanceof File)) {
      return { error: "No file provided. Please upload a PDF file.", status: 400 };
    }

    // Validate file type
    if (!SUPPORTED_TYPES.includes(file.type)) {
      return { error: `Invalid file type. Only PDF files are supported. Received: ${file.type}`, status: 400 };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = Math.round(file.size / (1024 * 1024) * 100) / 100;
      return { error: `File size (${sizeMB}MB) exceeds the 10MB limit. Please upload a smaller file.`, status: 400 };
    }

    // Validate file is not empty
    if (file.size === 0) {
      return { error: "Empty file provided. Please upload a valid PDF file.", status: 400 };
    }
    return { error: null, status: 200 };
}