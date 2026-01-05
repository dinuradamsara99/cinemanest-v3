'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CategoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong!</h2>
      <p className="text-zinc-400 mb-6 max-w-md">
        {error.message || "Failed to load category content. Please try again."}
      </p>
      <div className="flex gap-4">
        <Button 
          onClick={reset}
          className="bg-primary hover:bg-primary/90"
        >
          Try Again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}