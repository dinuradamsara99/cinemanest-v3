"use client";

import { ReactNode } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface ContentCarouselProps {
    title: string;
    children: ReactNode;
    itemsPerView?: {
        mobile: number;
        tablet: number;
        desktop: number;
    };
}

export function ContentCarousel({
    title,
    children,
    itemsPerView = { mobile: 2, tablet: 3, desktop: 5 },
}: ContentCarouselProps) {
    return (
        <section className="w-full py-8">
            <div className="container px-4 md:px-6">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
                    {title}
                </h2>

                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {children}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                </Carousel>
            </div>
        </section>
    );
}

interface CarouselItemWrapperProps {
    children: ReactNode;
    className?: string;
}

export function CarouselItemWrapper({ children, className = "" }: CarouselItemWrapperProps) {
    return (
        <CarouselItem className={`pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 ${className}`}>
            {children}
        </CarouselItem>
    );
}
