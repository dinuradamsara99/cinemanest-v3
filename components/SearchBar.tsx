"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Film, X, ArrowLeft, Star, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchMovies } from "@/lib/sanity";
import { urlFor } from "@/lib/sanity";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ... (Interfaces ටික පරණ විදිහමයි)
interface SearchResult {
    _id: string;
    _type: "movie" | "tvshow";
    title: string;
    slug: { current: string };
    posterImage?: {
        asset?: {
            _id: string;
            url: string;
        };
        alt?: string;
    };
    rating?: number;
    releaseYear?: number;
}

export function SearchBar({ className }: { className?: string }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Focus input on mobile expand
    useEffect(() => {
        if (isMobileExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isMobileExpanded]);

    // Search Logic
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        const timer = setTimeout(async () => {
            try {
                const searchResults = await searchMovies(query);
                setResults(searchResults || []);
                setIsOpen(true);
            } catch (error) {
                console.error("Search failed:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Click Outside Logic
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleResultClick = (slug: string) => {
        router.push(`/watch/${slug}`);
        setQuery("");
        setResults([]);
        setIsOpen(false);
        setIsMobileExpanded(false);
    };

    const getPosterUrl = (result: SearchResult) => {
        if (result.posterImage?.asset) {
            return urlFor(result.posterImage.asset).width(100).height(150).url();
        }
        return null;
    };

    const closeMobileSearch = () => {
        setIsMobileExpanded(false);
        setQuery("");
        setResults([]);
    };

    return (
        <div ref={searchRef} className={cn("flex items-center justify-end", className)}>

            {/* Mobile Trigger */}
            {!isMobileExpanded && (
                <button
                    onClick={() => setIsMobileExpanded(true)}
                    className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
                >
                    <Search className="h-6 w-6" />
                </button>
            )}

            {/* Main Container */}
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    "md:relative md:w-full md:max-w-xl md:opacity-100 md:visible md:flex",
                    isMobileExpanded
                        ? "fixed inset-0 z-[100] bg-[#09090b] flex flex-col px-4 pt-4"
                        : "hidden w-0 opacity-0"
                )}
            >
                {/* Header Area for Mobile */}
                <div className={cn("flex items-center gap-2 w-full", isMobileExpanded && "border-b border-zinc-800 pb-4 mb-2")}>
                    <button
                        onClick={closeMobileSearch}
                        className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>

                    <div className="relative w-full">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                            <Search className="h-4 w-4" />
                        </div>

                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Search movies..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Search movies and TV shows"
                            className={cn(
                                "w-full h-11 pl-10 pr-10",
                                "bg-zinc-900/50 border-zinc-800",
                                "focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-zinc-700",
                                "text-sm placeholder:text-zinc-500",
                                "rounded-full transition-all duration-200",
                                "md:bg-zinc-900/50 bg-zinc-900"
                            )}
                        />

                        {isLoading ? (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                            </div>
                        ) : query && (
                            <button
                                onClick={() => setQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Dropdown */}
                {isOpen && results.length > 0 && (
                    <div
                        className={cn(
                            "bg-[#09090b]/95 backdrop-blur-xl border border-zinc-800",
                            "shadow-2xl overflow-hidden z-[99]",
                            "md:absolute md:top-full md:mt-2 md:w-full md:rounded-[10px] md:max-h-[450px]",
                            isMobileExpanded ? "flex-1 w-full border-none bg-transparent overflow-y-auto" : "absolute rounded-[10px]",
                            "animate-in fade-in slide-in-from-top-2 duration-200"
                        )}
                    >
                        {/* 1. මෙතන padding එක අඩු කළා (py-1) */}
                        <div className="p-2 space-y-1">
                            {results.map((result) => (
                                <button
                                    key={result._id}
                                    onClick={() => handleResultClick(result.slug.current)}
                                    className={cn(
                                        "w-full flex items-start gap-3 p-2", // 2. Gap සහ Padding හැදුවා (p-3 වෙනුවට p-2)
                                        "hover:bg-zinc-800/80 transition-all duration-200", // 3. Hover එක තද කළා
                                        "rounded-[6px] group text-left" // 4. border-b අයින් කරලා rounded-lg දැම්මා
                                    )}
                                >
                                    {/* Poster Image */}
                                    {/* 5. Radius අඩු කළා (rounded-sm) සහ Size එක fix කළා */}
                                    <div className="relative flex-shrink-0 w-[45px] h-[68px] bg-zinc-800 rounded-[4px] overflow-hidden shadow-sm ring-1 ring-white/5 group-hover:ring-white/20 transition-all">
                                        {getPosterUrl(result) ? (
                                            <Image
                                                src={getPosterUrl(result)!}
                                                alt={result.posterImage?.alt || result.title}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                sizes="50px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Film className="h-5 w-5 text-zinc-600" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center h-[68px]">
                                        <h3 className="font-semibold text-sm text-zinc-200 group-hover:text-primary transition-colors truncate leading-tight">
                                            {result.title}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-zinc-500 font-medium">
                                            {result.releaseYear && (
                                                <span className="text-zinc-400">{result.releaseYear}</span>
                                            )}

                                            {/* Type Badge */}
                                            <span className="bg-zinc-800/80 text-zinc-400 px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider text-[10px]">
                                                {result._type === "tvshow" ? "TV" : "Movie"}
                                            </span>

                                            {/* Rating */}
                                            {result.rating && (
                                                <div className="flex items-center gap-1 text-yellow-500/90 ml-auto">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <span>{result.rating.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results Message */}
                {isOpen && !isLoading && query.trim() && results.length === 0 && (
                    <div
                        className={cn(
                            "bg-[#09090b]/95 backdrop-blur-xl border border-zinc-800",
                            "p-6 text-center", // Padding අඩු කළා
                            "md:absolute md:top-full md:mt-2 md:w-full md:rounded-xl",
                            isMobileExpanded ? "mt-4 w-full border-none bg-transparent" : "absolute rounded-xl"
                        )}
                    >
                        <div className="flex flex-col items-center justify-center gap-2">
                            <Search className="h-5 w-5 text-zinc-600" />
                            <p className="text-sm text-zinc-500">
                                No results found
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}