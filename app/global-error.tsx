'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center bg-[#121212] text-white">
                    <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    )
}
