import { Skeleton } from "@/components/ui/skeleton";

export function HeroSliderSkeleton() {
    return (
        // 1. Outer Container with Padding (HeroSlider එකේ වගේමයි)
        <div className="w-full p-4 md:p-8">
            <div className="relative w-full h-[60vh] md:h-[75vh] rounded-3xl overflow-hidden bg-zinc-900/50 ring-1 ring-white/5">

                {/* Background Skeleton */}
                <Skeleton className="w-full h-full bg-zinc-800 rounded-3xl" />

                {/* Content Overlay Area */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
                    <div className="max-w-4xl">

                        {/* Meta Info Skeleton (Year & Rating Badge) */}
                        <div className="flex items-center gap-3 mb-4">
                            <Skeleton className="h-6 w-16 rounded bg-zinc-700" />
                            <Skeleton className="h-6 w-12 rounded bg-zinc-700" />
                        </div>

                        {/* Title Skeleton */}
                        <Skeleton className="h-10 md:h-16 lg:h-20 w-3/4 md:w-1/2 mb-6 rounded-lg bg-zinc-700" />

                        {/* Description Skeleton (Lines) */}
                        <div className="space-y-2 mb-8 max-w-2xl">
                            <Skeleton className="h-4 w-full bg-zinc-700/50" />
                            <Skeleton className="h-4 w-[90%] bg-zinc-700/50" />
                            <Skeleton className="h-4 w-[60%] bg-zinc-700/50" />
                        </div>

                        {/* Buttons Skeleton */}
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                            {/* Play Button */}
                            <Skeleton className="h-12 w-full sm:w-40 rounded-md bg-zinc-700" />
                            {/* Info Button */}
                            <Skeleton className="h-12 w-full sm:w-40 rounded-md bg-zinc-700/50" />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}