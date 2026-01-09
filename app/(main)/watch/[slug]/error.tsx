"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Watch Page Error:", error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-red-500/10 p-4 rounded-full mb-4">
                <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong!</h2>
            <p className="text-zinc-400 max-w-md mb-6">
                We couldn't load this content. It might be due to a connection issue or the content is temporarily unavailable.
            </p>
            <div className="flex gap-4">
                <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                >
                    Reload Page
                </Button>
                <Button
                    onClick={() => reset()}
                    className="bg-primary hover:bg-primary/90"
                >
                    Try Again
                </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 p-4 bg-black/50 rounded text-left text-xs font-mono text-red-400 max-w-lg overflow-auto">
                    <p className="font-bold mb-1">Error Details:</p>
                    {error.message}
                    {error.digest && <p className="mt-1 opacity-70">Digest: {error.digest}</p>}
                </div>
            )}
        </div>
    );
}
