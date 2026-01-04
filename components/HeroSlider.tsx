"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, Star } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { urlFor } from "@/lib/sanity";
import { cn } from "@/lib/utils";

interface FeaturedItem {
    _id: string;
    _type: string;
    title: string;
    slug: { current: string };
    description?: string;
    releaseYear?: number;
    rating?: number; // Rating එකක් තිබුණොත් ලස්සනයි
    bannerImage?: any;
    posterImage?: any;
}

interface HeroSliderProps {
    items: FeaturedItem[];
}

export function HeroSlider({ items }: HeroSliderProps) {
    const plugin = useRef(
        Autoplay({ delay: 6000, stopOnInteraction: true })
    );

    if (!items || items.length === 0) {
        return null;
    }

    return (
        // 1. Main Container එක: වටේට ඉඩ තියාගන්න (p-4 md:p-8)
        <div className="w-full px-4 pb-4 pt-0 md:px-8 md:pb-8 md:pt-0 relative group/carousel-container">
            <Carousel
                opts={{
                    align: "center",
                    loop: true,
                }}
                plugins={[plugin.current]}
                className="w-full rounded-3xl overflow-hidden ring-1 ring-white/5"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent>
                    {items.map((item) => {
                        const imageUrl = item.bannerImage?.asset
                            ? urlFor(item.bannerImage).width(1920).height(1080).url()
                            : item.posterImage?.asset
                                ? urlFor(item.posterImage).width(1920).height(1080).url()
                                : "/placeholder.jpg";

                        return (
                            <CarouselItem key={item._id} className="h-[60vh] md:h-[75vh]">
                                <div className="relative w-full h-full">
                                    {/* Background Image with Rounded Corners */}
                                    <Image
                                        src={imageUrl}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        priority
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1400px"
                                    />

                                    {/* Modern Gradient Overlay (Vignette Effect) */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent md:from-[#09090b] md:via-[#09090b]/40" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-transparent to-[#09090b]/20 opacity-60" />

                                    {/* Content Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
                                        <div className="max-w-4xl">
                                            {/* Meta Info (Year, Rating) */}
                                            <div className="flex items-center gap-3 text-sm font-medium text-zinc-300 mb-3">
                                                {item.releaseYear && (
                                                    <span className="bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded">{item.releaseYear}</span>
                                                )}
                                                {item.rating && (
                                                    <div className="flex items-center gap-1 text-yellow-400">
                                                        <Star className="w-4 h-4 fill-current" />
                                                        <span>{item.rating}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-4 leading-tight drop-shadow-xl">
                                                {item.title}
                                            </h1>

                                            {/* Description */}
                                            {item.description && (
                                                <p className="text-sm md:text-lg text-zinc-300/90 max-w-2xl mb-8 line-clamp-3 drop-shadow-md leading-relaxed">
                                                    {item.description}
                                                </p>
                                            )}

                                            {/* Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                                                <Link href={`/watch/${item.slug.current}`}>
                                                    <Button
                                                        size="lg"
                                                        className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
                                                    >
                                                        <Play className="w-6 h-6 mr-3 fill-current" />
                                                        Play Now
                                                    </Button>
                                                </Link>
                                                <Link href={`/watch/${item.slug.current}`}>
                                                    <Button
                                                        size="lg"
                                                        variant="outline"
                                                        className="w-full sm:w-auto h-12 px-8 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:border-white/40 font-semibold"
                                                    >
                                                        {/* මෙන්න මෙතන මාරු කරන්න */}
                                                        <Info className="w-6 h-6 mr-3" />
                                                        More Info
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>

                {/* Navigation Arrows - Hover කළාම විතරක් පේන විදිහට */}
                <CarouselPrevious className="hidden md:flex h-12 w-12 left-4 border-white/10 bg-black/30 text-white hover:bg-black/50 hover:border-white/30 opacity-0 group-hover/carousel-container:opacity-100 transition-all duration-300" />
                <CarouselNext className="hidden md:flex h-12 w-12 right-4 border-white/10 bg-black/30 text-white hover:bg-black/50 hover:border-white/30 opacity-0 group-hover/carousel-container:opacity-100 transition-all duration-300" />
            </Carousel>
        </div>
    );
}