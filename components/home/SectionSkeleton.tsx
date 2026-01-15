
import { Skeleton } from "@/components/ui/skeleton";

export function SectionSkeleton({ title }: { title: string }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-4 md:px-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
            </div>

            {/* Horizontal Scroll Skeleton */}
            <div className="flex gap-4 overflow-hidden px-4 md:px-8 pb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex-none w-[160px] md:w-[200px] aspect-[2/3]">
                        <Skeleton className="h-full w-full rounded-xl bg-zinc-800" />
                        <div className="mt-3 space-y-2">
                            <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                            <Skeleton className="h-3 w-1/2 bg-zinc-800" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
