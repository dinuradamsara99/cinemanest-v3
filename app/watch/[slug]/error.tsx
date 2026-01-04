'use client'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center bg-[#121212] text-white">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-zinc-400 mb-4">
                We couldn't load this movie. Please try again.
            </p>
            <button
                onClick={() => reset()}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
                Try again
            </button>
        </div>
    )
}
