'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFormStore } from "@/lib/store";

export function PageNavigation() {
  const [jumpToPage, setJumpToPage] = useState<string>("");
  
  // Selective subscriptions for page navigation state
  const currentPage = useFormStore(state => state.currentPage);
  const totalPages = useFormStore(state => state.totalPages);
  const setCurrentPage = useFormStore(state => state.setCurrentPage);

  /**
   * Navigate to the previous page
   */
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      scrollToPage(currentPage - 1);
    }
  };

  /**
   * Navigate to the next page
   */
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      scrollToPage(currentPage + 1);
    }
  };

  /**
   * Handle jump to specific page input
   */
  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(jumpToPage, 10);
    
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      scrollToPage(pageNumber);
      setJumpToPage("");
    }
  };

  /**
   * Smooth scroll to a specific page in the PDF viewer
   */
  const scrollToPage = (pageNumber: number) => {
    const pageElement = document.getElementById(`pdf-page-${pageNumber}`);
    if (pageElement) {
      pageElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Don't render if no pages loaded
  if (totalPages === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-3 border-b bg-background/50 backdrop-blur-sm">
      {/* Previous page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={goToPreviousPage}
        disabled={currentPage <= 1}
        className="px-2"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Current page info */}
      <span className="text-sm text-muted-foreground min-w-max">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={goToNextPage}
        disabled={currentPage >= totalPages}
        className="px-2"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Jump to page input (only show if more than 3 pages) */}
      {totalPages > 3 && (
        <>
          <div className="w-px h-6 bg-border mx-2" />
          <form onSubmit={handleJumpToPage} className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              max={totalPages}
              value={jumpToPage}
              onChange={(e) => setJumpToPage(e.target.value)}
              placeholder="Go to..."
              className="w-20 h-8 text-sm"
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="h-8 px-3 text-sm"
            >
              Go
            </Button>
          </form>
        </>
      )}
    </div>
  );
}