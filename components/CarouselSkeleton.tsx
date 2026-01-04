import { Skeleton } from "@/components/ui/skeleton";
import { CarouselItemWrapper } from "@/components/ContentCarousel";

interface CarouselSkeletonProps {
    title: string;
    count?: number;
}

export function CarouselSkeleton({ title, count = 5 }: CarouselSkeletonProps) {
    return (
        <section className="w-full py-8">
            <div className="w-full px-4 md:px-8">
                <Skeleton className="h-8 w-48 mb-6" />

                <div className="flex gap-x-4 md:gap-x-6 overflow-x-auto pb-4 -mx-4 px-4 md:-mx-8 md:px-8">
                    {Array.from({ length: count }).map((_, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-[45%] sm:w-[30%] md:w-[23%] lg:w-[18%]"
                        >
                            <div className="space-y-2">
                                <Skeleton className="aspect-[2/3] w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
