
import { Skeleton } from "@/components/ui/skeleton";

export function SectionSkeleton({ title }: { title: string }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-4 md:px-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
            </div>

            {/* Horizontal Scroll Skeleton - Matching MediaCard sizes */}
            <div className="flex gap-3 md:gap-4 overflow-hidden px-4 md:px-8 pb-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex-none w-[calc(50%-6px)] sm:w-[calc(33.33%-10px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)]"
                    >
                        <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-900 shadow-md ring-1 ring-white/5" style={{ aspectRatio: "3/4" }}>
                            <Skeleton className="absolute inset-0 w-full h-full rounded-none bg-zinc-800" />
                        </div>
                        <div className="mt-3 space-y-2 px-1">
                            <Skeleton className="h-5 w-4/5 bg-zinc-800 rounded" />
                            <Skeleton className="h-3 w-1/2 bg-zinc-800/60 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
