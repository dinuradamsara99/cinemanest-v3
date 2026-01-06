"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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

            {/* Desktop Search Input */}
            <div className="relative hidden md:block w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search movies..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (query.trim() && results.length > 0) setIsOpen(true);
                    }}
                    className="w-full h-10 pl-10 pr-10 bg-zinc-900/50 border-zinc-800 focus:bg-zinc-900 focus:border-zinc-700 rounded-full transition-all"
                />
                {isLoading ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    </div>
                ) : query && (
                    <button
                        onClick={() => {
                            setQuery("");
                            setResults([]);
                            inputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Desktop Results Dropdown */}
            {isOpen && results.length > 0 && !isMobileExpanded && (
                <div
                    className={cn(
                        "absolute top-[calc(100%+2px)] left-46 right-5 m-4 w-[450px] rounded-2xl",
                        "bg-[#09090b]/90 backdrop-blur-3xl border border-zinc-800/80 ring-1 ring-white/10",
                        "shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden z-[99] max-h-[500px]",
                        "animate-in fade-in slide-in-from-top-3 duration-300 ease-out"
                    )}
                >
                    {/* Header */}
                    <div className="px-5 py-3.5 border-b border-zinc-800/50 bg-white/[0.02]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search className="w-3.5 h-3.5 text-primary" />
                                <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Top Results</h3>
                            </div>
                            <span className="text-[10px] bg-zinc-800/50 text-zinc-500 px-2 py-0.5 rounded-full font-mono">{results.length} found</span>
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="p-2 overflow-y-auto max-h-[420px] scrollbar-thin scrollbar-thumb-zinc-700/50 scrollbar-track-transparent">
                        <div className="flex flex-col gap-1">
                            {results.map((result, index) => (
                                <button
                                    key={result._id}
                                    onClick={() => handleResultClick(result.slug.current)}
                                    className={cn(
                                        "relative w-full flex items-center gap-4 p-3",
                                        "hover:bg-white/[0.04] transition-all duration-300",
                                        "rounded-xl group text-left border border-transparent hover:border-white/[0.05]"
                                    )}
                                >
                                    {/* Number Index for Professional Feel */}
                                    <span className="text-[10px] font-mono text-zinc-700 group-hover:text-zinc-500 w-3 text-right tabular-nums transition-colors">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </span>

                                    <div className="relative flex-shrink-0 rounded-[8px] w-[52px] h-[78px] bg-zinc-800 overflow-hidden shadow-md group-hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.8)] transition-all group-hover:scale-105 ring-1 ring-black/20 group-hover:ring-white/10">
                                        {getPosterUrl(result) ? (
                                            <Image
                                                src={getPosterUrl(result)!}
                                                alt={result.posterImage?.alt || result.title}
                                                fill
                                                className="object-cover"
                                                sizes="52px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                                <Film className="h-5 w-5 text-zinc-700" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                                        <h3 className="font-semibold text-[15px] text-zinc-200 group-hover:text-primary transition-colors truncate tracking-tight">
                                            {result.title}
                                        </h3>

                                        <div className="flex items-center gap-3 text-xs">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm",
                                                result._type === "tvshow"
                                                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                            )}>
                                                {result._type === "tvshow" ? "TV Series" : "Movie"}
                                            </span>

                                            {result.releaseYear && (
                                                <span className="text-zinc-500 font-medium font-mono">
                                                    {result.releaseYear}
                                                </span>
                                            )}

                                            {result.rating && (
                                                <div className="flex items-center gap-1.5 ml-auto mr-1 pl-3 border-l border-zinc-800/50">
                                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                    <span className="font-bold text-zinc-300 tabular-nums">
                                                        {result.rating.toFixed(1)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Chevron for indication */}
                                    <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-zinc-500">
                                        <ArrowLeft className="w-4 h-4 rotate-180" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Overlay Portal */}
            {isMobileExpanded && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] bg-[#09090b] flex flex-col px-4 pt-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 w-full border-b border-zinc-800 pb-4 mb-2">
                        <button
                            onClick={closeMobileSearch}
                            className="p-2 -ml-2 text-zinc-400 hover:text-white"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>

                        <div className="relative w-full">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                                <Search className="h-4 w-4" />
                            </div>

                            <Input
                                autoFocus
                                type="text"
                                placeholder="Search movies..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full h-11 pl-10 pr-10 bg-zinc-900 border-zinc-800 rounded-full"
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

                    {isOpen && results.length > 0 ? (
                        <div className="flex-1 w-full overflow-y-auto pb-20">
                            <div className="p-2 space-y-1">
                                {results.map((result) => (
                                    <button
                                        key={result._id}
                                        onClick={() => handleResultClick(result.slug.current)}
                                        className="w-full flex items-start gap-3 p-2 hover:bg-zinc-800/50 transition-all duration-200 rounded-[6px] group text-left"
                                    >
                                        <div className="relative flex-shrink-0 w-[45px] h-[68px] bg-zinc-800 rounded-[4px] overflow-hidden shadow-sm ring-1 ring-white/5">
                                            {getPosterUrl(result) ? (
                                                <Image
                                                    src={getPosterUrl(result)!}
                                                    alt={result.posterImage?.alt || result.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Film className="h-5 w-5 text-zinc-600" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col justify-center h-[68px]">
                                            <h3 className="font-semibold text-sm text-zinc-200 truncate leading-tight">
                                                {result.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-zinc-500 font-medium">
                                                {result.releaseYear && <span>{result.releaseYear}</span>}
                                                <span className="bg-zinc-800/80 text-zinc-400 px-1.5 py-0.5 rounded-[4px] text-[10px]">
                                                    {result._type === "tvshow" ? "TV" : "Movie"}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : isOpen && !isLoading && query.trim() && (
                        <div className="p-6 text-center mt-4">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Search className="h-5 w-5 text-zinc-600" />
                                <p className="text-sm text-zinc-500">No results found</p>
                            </div>
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}