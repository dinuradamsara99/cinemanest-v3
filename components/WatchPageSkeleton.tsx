import { Skeleton } from "@/components/ui/skeleton";

export function WatchPageSkeleton() {
    return (
        <div className="relative min-h-screen bg-[#121212] text-zinc-100">

            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-full h-[80vh] overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 bg-[#121212] z-10" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">

                <div className="flex flex-col gap-10">

                    {/* Video Player */}
                    {/* Video Player */}
                    <div className="relative w-full aspect-video bg-zinc-900/80 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                        <Skeleton className="h-full w-full rounded-xl bg-zinc-800/20" />
                    </div>

                    {/* Movie Info Section */}
                    <div className="flex flex-col gap-6">
                        {/* Title */}
                        <Skeleton className="h-10 md:h-12 w-[65%] bg-zinc-800/80 rounded-lg" />

                        {/* Meta Row */}
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-5 w-10 bg-zinc-800" />
                            <Skeleton className="h-5 w-14 bg-zinc-800" />
                            <Skeleton className="h-5 w-14 bg-zinc-800" />
                            <Skeleton className="h-6 w-20 rounded-md bg-zinc-800" />
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-full bg-zinc-800/50" />
                            <Skeleton className="h-5 w-[90%] bg-zinc-800/50" />
                            <Skeleton className="h-5 w-[70%] bg-zinc-800/50" />
                        </div>

                        {/* Details Board */}
                        <div className="mt-4 rounded-2xl border border-white/5 bg-zinc-900/80 overflow-hidden p-6">
                            <div className="grid grid-cols-2 gap-6">
                                <Skeleton className="h-6 w-32 bg-zinc-800" />
                                <Skeleton className="h-6 w-24 bg-zinc-800" />
                            </div>
                            <div className="flex gap-2 mt-6">
                                <Skeleton className="h-7 w-20 rounded-full bg-zinc-800/60" />
                                <Skeleton className="h-7 w-24 rounded-full bg-zinc-800/60" />
                                <Skeleton className="h-7 w-16 rounded-full bg-zinc-800/60" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Episodes Section - Simple */}
                <div className="mt-8 rounded-2xl border border-white/5 bg-zinc-900/80 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <Skeleton className="h-7 w-28 bg-zinc-800" />
                        <Skeleton className="h-9 w-48 rounded-full bg-zinc-800/50" />
                    </div>

                    {/* Episode Cards - Only card + description */}
                    <div className="p-6 bg-black/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                    key={i}
                                    className="flex gap-4 p-3 rounded-xl border border-white/5 bg-zinc-900/50"
                                >
                                    {/* Thumbnail */}
                                    <Skeleton className="w-36 aspect-video shrink-0 rounded-[10px] bg-zinc-800/50" />

                                    {/* Text - Episode number, title, description */}
                                    <div className="flex flex-col justify-center flex-1 py-1 space-y-2">
                                        <Skeleton className="h-3 w-12 bg-zinc-700" />
                                        <Skeleton className="h-4 w-[85%] bg-zinc-800" />
                                        <Skeleton className="h-3 w-full bg-zinc-800/40" />
                                        <Skeleton className="h-3 w-[70%] bg-zinc-800/40" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}