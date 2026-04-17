'use client'

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong!</AlertTitle>
          <AlertDescription className="mt-2">
            {error.message || "An unexpected error occurred."}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={reset} 
          className="mt-4 w-full"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}