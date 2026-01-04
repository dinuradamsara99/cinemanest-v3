import { Skeleton } from "@/components/ui/skeleton";

export function WatchPageSkeleton() {
    return (
        <div className="relative min-h-screen bg-[#09090b] text-zinc-100 pb-20 overflow-hidden">

            {/* Ambient Background Skeleton (Matches the blur effect) */}
            <div className="absolute top-0 left-0 w-full h-[80vh] bg-gradient-to-b from-zinc-900/20 via-[#09090b]/60 to-[#09090b] pointer-events-none z-0" />

            <div className="relative z-10 container mx-auto px-4 pt-6 max-w-6xl">

                {/* Back Button Skeleton */}
                <div className="mb-6">
                    <Skeleton className="h-10 w-32 rounded-md bg-zinc-800/50" />
                </div>

                <div className="flex flex-col gap-10">

                    {/* Video Player Skeleton */}
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 relative shadow-2xl">
                        <Skeleton className="absolute inset-0 bg-zinc-900" />
                        {/* Center Play Icon Placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-16 w-16 rounded-full bg-zinc-800/50 flex items-center justify-center">
                                <Skeleton className="h-8 w-8 rounded-full bg-zinc-700/50" />
                            </div>
                        </div>
                    </div>

                    {/* Movie Info & Details Section (Single Column) */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                {/* Title */}
                                <Skeleton className="h-10 md:h-12 w-3/4 mb-2 bg-zinc-800 rounded-lg" />

                                {/* Meta Row (Rating, Year, Duration, Type) */}
                                <div className="flex flex-wrap items-center gap-4">
                                    <Skeleton className="h-5 w-12 bg-zinc-800" />
                                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                    <Skeleton className="h-5 w-16 bg-zinc-800" />
                                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                    <Skeleton className="h-5 w-16 bg-zinc-800" />
                                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                    <Skeleton className="h-6 w-20 rounded-full bg-zinc-800" />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 mt-1">
                                    <Skeleton className="h-10 w-32 rounded-md bg-zinc-800" />
                                </div>

                                {/* Video AI Insights Skeleton */}
                                <div className="mt-2 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
                                    <Skeleton className="h-5 w-48 mb-3 bg-zinc-800" /> {/* Heading */}
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full bg-zinc-800/50" />
                                        <Skeleton className="h-4 w-5/6 bg-zinc-800/50" />
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Skeleton className="h-6 w-24 rounded-full bg-zinc-800" />
                                        <Skeleton className="h-6 w-24 rounded-full bg-zinc-800" />
                                    </div>
                                </div>

                                {/* Description Lines */}
                                <div className="space-y-3 mt-2">
                                    <Skeleton className="h-4 w-full bg-zinc-800/60" />
                                    <Skeleton className="h-4 w-11/12 bg-zinc-800/60" />
                                    <Skeleton className="h-4 w-4/5 bg-zinc-800/60" />
                                </div>

                                {/* Extra Details Box (Credits, Language, Genres) */}
                                <div className="flex flex-col gap-6 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 mt-4">
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-20 bg-zinc-800" />
                                        <Skeleton className="h-4 w-40 bg-zinc-700/50" />
                                    </div>
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-24 bg-zinc-800" />
                                        <Skeleton className="h-4 w-24 bg-zinc-700/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-16 bg-zinc-800" />
                                        <div className="flex flex-wrap gap-2">
                                            <Skeleton className="h-6 w-20 rounded-full bg-zinc-800" />
                                            <Skeleton className="h-6 w-16 rounded-full bg-zinc-800" />
                                            <Skeleton className="h-6 w-24 rounded-full bg-zinc-800" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Episodes Section Skeleton */}
                    <div className="pt-8 border-t border-white/5">
                        {/* Header Row: Title + Search */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-8 w-32 bg-zinc-800" />
                                <Skeleton className="h-4 w-24 bg-zinc-800 hidden sm:block" />
                            </div>
                            {/* Search Bar Skeleton */}
                            <Skeleton className="h-9 w-full sm:w-64 rounded-full bg-zinc-900 border border-zinc-800" />
                        </div>

                        {/* Season Tabs */}
                        <div className="flex gap-4 mb-6 overflow-hidden">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-9 w-28 rounded-full bg-zinc-800" />
                            ))}
                        </div>

                        {/* Episodes Grid Skeleton */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                    key={i}
                                    className="flex flex-col gap-3 p-3 rounded-[20px] bg-zinc-900/20 border border-white/5"
                                >
                                    {/* Thumbnail */}
                                    <div className="w-full aspect-video rounded-[10px] overflow-hidden bg-zinc-900 relative">
                                        <Skeleton className="h-full w-full bg-zinc-800/50" />
                                        {/* Play Icon Placeholder */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="h-8 w-8 rounded-full bg-zinc-800/80" />
                                        </div>
                                    </div>

                                    {/* Text Info */}
                                    <div className="space-y-2 px-1">
                                        <div className="flex justify-between items-center">
                                            <Skeleton className="h-5 w-3/4 bg-zinc-800" />
                                        </div>
                                        <Skeleton className="h-3 w-full bg-zinc-800/50" />
                                        <Skeleton className="h-3 w-1/2 bg-zinc-800/50" />
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