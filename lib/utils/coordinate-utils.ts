import type { NormalizedRect } from "@/lib/types";

/**
 * Convert Azure's bounding polygon (8 numbers: [x1,y1,x2,y2,x3,y3,x4,y4])
 * into a normalized 0-1 rect relative to page dimensions.
 * Azure returns coordinates in inches for PDFs.
 * 
 * @param polygon Array of 8 numbers representing polygon points
 * @param pageWidth Page width in inches (from Azure response)
 * @param pageHeight Page height in inches (from Azure response)
 * @returns NormalizedRect with values between 0 and 1
 */
export function polygonToNormalizedRect(
  polygon: number[],
  pageWidth: number,
  pageHeight: number
): NormalizedRect {
  if (polygon.length < 8) {
    throw new Error("Invalid polygon: expected at least 8 numbers");
  }

  if (pageWidth <= 0 || pageHeight <= 0) {
    throw new Error("Invalid page dimensions: width and height must be positive");
  }

  // Extract x and y coordinates from the polygon
  const xValues = [polygon[0], polygon[2], polygon[4], polygon[6]];
  const yValues = [polygon[1], polygon[3], polygon[5], polygon[7]];

  // Find bounding box
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  // Normalize to 0-1 scale
  const normalizedRect: NormalizedRect = {
    top: minY / pageHeight,
    left: minX / pageWidth,
    width: (maxX - minX) / pageWidth,
    height: (maxY - minY) / pageHeight,
  };

  // Clamp values to ensure they're within 0-1 bounds
  return {
    top: Math.max(0, Math.min(1, normalizedRect.top)),
    left: Math.max(0, Math.min(1, normalizedRect.left)),
    width: Math.max(0, Math.min(1, normalizedRect.width)),
    height: Math.max(0, Math.min(1, normalizedRect.height)),
  };
}

/**
 * Convert normalized coordinates back to pixel coordinates for a given container size.
 * Useful for positioning overlays on rendered PDF pages.
 * 
 * @param normalizedRect Normalized coordinates (0-1 scale)
 * @param containerWidth Container width in pixels
 * @param containerHeight Container height in pixels
 * @returns Pixel coordinates
 */
export function normalizedToPixels(
  normalizedRect: NormalizedRect,
  containerWidth: number,
  containerHeight: number
) {
  return {
    top: normalizedRect.top * containerHeight,
    left: normalizedRect.left * containerWidth,
    width: normalizedRect.width * containerWidth,
    height: normalizedRect.height * containerHeight,
  };
}