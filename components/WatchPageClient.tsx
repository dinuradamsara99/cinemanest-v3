"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, Play, Info, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomVideoPlayer } from "@/components/CustomVideoPlayer";
import { VideoAIInsights } from "@/components/VideoAIInsights";
import { MovieSchema } from "@/components/MovieSchema";
import { SubtitleDownload } from "@/components/SubtitleDownload";
import { CommentSection } from "@/components/CommentSection";
import { AuthDialog } from "@/components/auth/AuthDialog";
import type { Movie, SubtitleTrack } from "@/types/movie";
import { urlFor } from "@/lib/sanity";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface WatchPageClientProps {
    movie: Movie;
}

export function WatchPageClient({ movie }: WatchPageClientProps) {
    const router = useRouter();
    const castContainerRef = useRef<HTMLDivElement>(null);
    const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0);
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
    const [episodeSearchQuery, setEpisodeSearchQuery] = useState("");
    const [trailerOpen, setTrailerOpen] = useState(false);
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const [showCastArrows, setShowCastArrows] = useState(false);

    // Check if cast list is scrollable
    useEffect(() => {
        const checkScroll = () => {
            if (castContainerRef.current) {
                const { scrollWidth, clientWidth } = castContainerRef.current;
                setShowCastArrows(scrollWidth > clientWidth);
            }
        };

        // Check initially and on resize
        checkScroll();
        window.addEventListener('resize', checkScroll);

        return () => window.removeEventListener('resize', checkScroll);
    }, [movie.cast]);

    // Cast Scroll Handler
    const scrollCast = (direction: 'left' | 'right') => {
        if (castContainerRef.current) {
            const { current } = castContainerRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Convert YouTube URL to embed format
    const getYouTubeEmbedUrl = (url: string): string => {
        if (!url) return url;

        // Already an embed URL
        if (url.includes('/embed/')) return url;

        // Extract video ID from various YouTube URL formats
        let videoId = '';

        // Format: https://www.youtube.com/watch?v=VIDEO_ID
        const watchMatch = url.match(/[?&]v=([^&]+)/);
        if (watchMatch) {
            videoId = watchMatch[1];
        }

        // Format: https://youtu.be/VIDEO_ID
        const shortMatch = url.match(/youtu\.be\/([^?]+)/);
        if (shortMatch) {
            videoId = shortMatch[1];
        }

        // If we found a video ID, return embed URL
        if (videoId) {
            return `https://www.youtube-nocookie.com/embed/${videoId}`;
        }

        // Return original URL if not a YouTube URL
        return url;
    };

    // Determine if this is a TV show
    const isTVShow =
        (movie._type === "tvshow" || movie.contentType === "tvshow") &&
        !!movie.seasons?.length;

    // Get current video URL and subtitles
    let currentVideoUrl: string | undefined;
    let currentIframeUrl: string | undefined;
    let currentSubtitles: SubtitleTrack[] | undefined;
    let currentTitle = movie.title;
    let episodeName: string | undefined;
    let posterUrl: string | undefined;

    if (isTVShow && movie.seasons && movie.seasons.length > 0) {
        const currentSeason = movie.seasons[currentSeasonIndex];
        if (currentSeason && currentSeason.episodes && currentSeason.episodes.length > 0) {
            const currentEpisode = currentSeason.episodes[currentEpisodeIndex];
            currentVideoUrl = currentEpisode.videoUrl;
            currentIframeUrl = currentEpisode.iframeUrl;
            currentSubtitles = currentEpisode.subtitles;
            currentTitle = `${movie.title} - S${currentSeason.seasonNumber}E${currentEpisode.episodeNumber}: ${currentEpisode.title}`;
            episodeName = `S${currentSeason.seasonNumber}E${currentEpisode.episodeNumber}: ${currentEpisode.title}`;

            // Use episode thumbnail if available, fallback to movie poster or TMDB backdrop
            if (currentEpisode.thumbnail?.asset) {
                posterUrl = urlFor(currentEpisode.thumbnail).width(1280).height(720).url();
            } else if (movie.posterImage?.asset) {
                posterUrl = urlFor(movie.posterImage).width(1280).height(720).url();
            } else if (movie.tmdbBackdropPath) {
                posterUrl = movie.tmdbBackdropPath;
            }
        }
    } else {
        currentVideoUrl = movie.videoUrl;
        currentIframeUrl = movie.iframeUrl;
        currentSubtitles = movie.subtitles;

        // Use movie poster or TMDB backdrop for movies
        if (movie.posterImage?.asset) {
            posterUrl = urlFor(movie.posterImage).width(1280).height(720).url();
        } else if (movie.tmdbBackdropPath) {
            posterUrl = movie.tmdbBackdropPath;
        }
    }

    // Convert Sanity subtitles to player format
    const [playerSubtitles, setPlayerSubtitles] = useState<import("@/lib/subtitleConverter").PlayerSubtitle[]>([]);

    useEffect(() => {
        let isMounted = true;
        const loadSubtitles = async () => {
            const processed = await import("@/lib/subtitleConverter").then(mod =>
                mod.processSubtitlesForPlayer(currentSubtitles)
            );
            if (isMounted) {
                setPlayerSubtitles(processed);
            }
        };
        loadSubtitles();
        return () => { isMounted = false; };
    }, [currentSubtitles]);

    // Check if URL is an embed
    const isEmbedUrl = (url: string) => {
        const embedDomains = [
            "youtube.com", "youtu.be", "vimeo.com", "streamwish", "filemoon",
            "doodstream", "streamtape", "mixdrop", "voe.sx", "bysesukior.com"
        ];
        return embedDomains.some((domain) => url.toLowerCase().includes(domain));
    };

    // Check if URL is an embed or if iframe URL is provided
    const shouldUseIframe = currentIframeUrl || (currentVideoUrl ? isEmbedUrl(currentVideoUrl) : false);
    const displayIframeUrl = currentIframeUrl || currentVideoUrl;

    // Handle episode click
    const handleEpisodeClick = (seasonIdx: number, episodeIdx: number) => {
        setCurrentSeasonIndex(seasonIdx);
        setCurrentEpisodeIndex(episodeIdx);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };



    // Helper Function: Calculate match score for weighted search
    // Returns: 100 (exact number), 75 (padded number), 50 (title match), 25 (partial number), 10 (overview), 0 (no match)
    const getMatchScore = (ep: any, query: string): number => {
        const lowerQuery = query.toLowerCase().trim();
        if (!lowerQuery) return 100; // No query = show all with same priority

        const epNum = ep.episodeNumber;
        const epNumString = epNum?.toString() || "";
        const queryNum = parseInt(lowerQuery, 10);

        // Exact number match: "2" matches Episode 2 exactly
        if (!isNaN(queryNum) && epNum === queryNum) {
            return 100;
        }

        // Padded number match: "02" matches Episode 2
        if (!isNaN(queryNum) && epNumString.padStart(2, '0') === lowerQuery.padStart(2, '0')) {
            return 75;
        }

        // Title exact match
        if (ep.title?.toLowerCase() === lowerQuery) {
            return 60;
        }

        // Title contains query
        if (ep.title?.toLowerCase().includes(lowerQuery)) {
            return 50;
        }

        // Partial number match: "1" matches "10", "11", "12", etc.
        if (!isNaN(queryNum) && epNumString.includes(lowerQuery)) {
            return 25;
        }

        // Overview contains query
        if (ep.overview?.toLowerCase().includes(lowerQuery)) {
            return 10;
        }

        return 0; // No match
    };

    // Helper: Check if episode matches (score > 0)
    const checkMatch = (ep: any, query: string): boolean => {
        return getMatchScore(ep, query) > 0;
    };

    return (
        <div className="relative min-h-screen bg-[#121212] text-zinc-100">
            {/* SEO: JSON-LD Structured Data */}
            <MovieSchema movie={movie} />

            {/* Ambient Background Glow */}
            {(movie.posterImage?.asset || movie.tmdbBackdropPath) && (
                <div className="absolute top-0 left-0 w-full h-[80vh] overflow-hidden pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[#121212] z-10" />
                    <Image
                        src={movie.posterImage?.asset ? urlFor(movie.posterImage).width(1200).url() : movie.tmdbBackdropPath!}
                        alt=""
                        fill
                        className="object-cover opacity-20 blur-3xl scale-110"
                        priority
                    />
                </div>
            )}

            {/* Main Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">



                <div className="flex flex-col gap-10">

                    {/* Video Player Container */}
                    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                        {(currentVideoUrl || currentIframeUrl) ? (
                            shouldUseIframe ? (
                                <iframe
                                    src={displayIframeUrl}
                                    className="w-full h-full"
                                    // පහත Sandbox කොටස එකතු කරන්න. එමගින් Ads සහ Redirects පාලනය වේ.
                                    sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title={currentTitle}
                                    referrerPolicy="no-referrer" // මෙයත් වැදගත් (Referrer සැඟවීමට)
                                />
                            ) : (
                                <CustomVideoPlayer
                                    key={currentVideoUrl}
                                    videoUrl={currentVideoUrl!}
                                    subtitles={playerSubtitles}
                                    title={isTVShow ? episodeName : currentTitle}
                                    isTVShow={isTVShow}
                                    poster={posterUrl}
                                    mediaId={movie.slug?.current}
                                    mediaType={isTVShow ? "episode" : "movie"}
                                />

                            )
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-4 bg-zinc-900/50">
                                <Info className="h-12 w-12 opacity-50" />
                                <p>Video currently unavailable</p>
                            </div>
                        )}
                    </div>

                    {/* Movie Info & Details Section */}
                    <div className="flex flex-col gap-8">
                        {/* Title, Actions, Desc */}
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                                    {movie.title}
                                </h1>

                                {/* Meta Row */}
                                <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-zinc-400 font-medium">
                                    <div className="flex items-center gap-1.5 text-yellow-500">
                                        <Star className="h-4 w-4 fill-current" />
                                        <span className="text-white font-bold">{movie.rating?.toFixed(1)}</span>
                                    </div>
                                    <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                    {movie.releaseYear && <span>{movie.releaseYear}</span>}
                                    {movie.duration && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                            <span>
                                                {movie.duration >= 60
                                                    ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`
                                                    : `${movie.duration}m`
                                                }
                                            </span>
                                        </>
                                    )}
                                    <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-zinc-700">
                                        {isTVShow ? "TV Series" : "Movie"}
                                    </Badge>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3 mt-1">
                                    {movie.trailerUrl && (
                                        <Button
                                            onClick={() => setTrailerOpen(true)}
                                            className="bg-white text-black hover:bg-zinc-200 font-semibold px-6"
                                        >
                                            <Play className="h-4 w-4 mr-2 fill-current" />
                                            Trailer
                                        </Button>
                                    )}
                                </div>
                                {/* AI Insights Section */}
                                <VideoAIInsights
                                    movieTitle={movie.title}
                                    movieDescription={movie.description}
                                    isTVShow={isTVShow}
                                    episodes={
                                        isTVShow && movie.seasons?.[currentSeasonIndex]?.episodes
                                            ? movie.seasons[currentSeasonIndex].episodes.map((ep) => ({
                                                episodeNumber: ep.episodeNumber,
                                                title: ep.title,
                                                seasonNumber: movie.seasons![currentSeasonIndex].seasonNumber,
                                            }))
                                            : []
                                    }
                                    onLoginClick={() => setAuthDialogOpen(true)}
                                />

                                {/* Description */}
                                {movie.description && (
                                    <p className="text-zinc-300 text-lg leading-9 mt-2 whitespace-pre-line">
                                        {movie.description}
                                    </p>
                                )}

                                {/* Extra Details - Below Description */}
                                {/* Modern Details Board */}
                                <div className="mt-8 rounded-2xl border border-white/5 bg-zinc-900/80 dark:bg-black/20 backdrop-blur-sm overflow-hidden">
                                    {/* Metadata Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8 border-b border-white/5">
                                        {movie.director && (
                                            <div className="flex flex-col gap-2">
                                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Director</h3>
                                                <p className="text-zinc-100 font-medium text-lg">{movie.director}</p>
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Original Language</h3>
                                            <p className="text-zinc-100 font-medium text-lg">{movie.tmdbOriginalLanguage || movie.language?.title || "English"}</p>
                                        </div>

                                        {movie.credit && (
                                            <div className="col-span-full flex flex-col gap-2">
                                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Credits</h3>
                                                <p className="text-zinc-400 text-sm leading-relaxed">{movie.credit}</p>
                                            </div>
                                        )}

                                        <div className="col-span-full flex flex-col gap-3">
                                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Genres</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {/* Prefer TMDB genres, fallback to CMS genres/categories */}
                                                {(movie.tmdbGenres && movie.tmdbGenres.length > 0) ? (
                                                    movie.tmdbGenres.map((g) => (
                                                        <Badge key={g} variant="outline" className="px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 border-zinc-700/50 transition-colors cursor-default">
                                                            {g}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <>
                                                        {movie.genre?.map((g) => (
                                                            <Badge key={g} variant="outline" className="px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 border-zinc-700/50 transition-colors cursor-default">
                                                                {g}
                                                            </Badge>
                                                        ))}
                                                        {movie.categories?.map((cat) => (
                                                            <Badge key={cat._id} variant="outline" className="px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 border-zinc-700/50 transition-colors cursor-default">
                                                                {cat.title}
                                                            </Badge>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {(movie.tmdbKeywords && movie.tmdbKeywords.length > 0) && (
                                            <div className="col-span-full flex flex-col gap-3">
                                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tags</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {movie.tmdbKeywords.map((keyword) => (
                                                        <Badge key={keyword} variant="secondary" className="px-2 py-0.5 bg-zinc-800 text-zinc-400 border-zinc-700/50 text-[10px] hover:bg-zinc-700 hover:text-zinc-200 transition-colors cursor-default">
                                                            {keyword}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cast Section */}
                                    {movie.cast && movie.cast.length > 0 && (
                                        <div className="p-6 sm:p-8 bg-black/20">
                                            <div className="flex items-center justify-between mb-6 px-1">
                                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Top Cast</h3>
                                                {showCastArrows && (
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-zinc-800/50 border-white/5 hover:bg-white/10 hover:border-white/20" onClick={() => scrollCast('left')}>
                                                            <ChevronLeft className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-zinc-800/50 border-white/5 hover:bg-white/10 hover:border-white/20" onClick={() => scrollCast('right')}>
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <div
                                                ref={castContainerRef}
                                                className="flex gap-4 overflow-x-auto pb-4 px-1 scroll-smooth"
                                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                            >
                                                {movie.cast.map((member, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex flex-col min-w-[140px] w-[140px] sm:min-w-[160px] sm:w-[160px] group cursor-default shrink-0"
                                                    >
                                                        <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 mb-3 shadow-md border border-white/5">
                                                            {member.profilePath ? (
                                                                <Image
                                                                    src={member.profilePath}
                                                                    alt={member.name}
                                                                    fill
                                                                    sizes="(max-width: 640px) 140px, 160px"
                                                                    placeholder="blur"
                                                                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAHhAAAgIBBQEAAAAAAAAAAAAAAQIDBAAFERIhMUH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ALc2n0Jb2JZtaq2Yol4JJzyYqN/fzHGpUbSG1ar2IrUkqSKHimmZlZSPCCPMYwf/2Q=="
                                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2 p-2 text-center">
                                                                    <div className="w-8 h-8 rounded-full bg-zinc-700/50" />
                                                                    <span className="text-xs">Image N/A</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col px-0.5">
                                                            <span className="text-sm font-bold text-zinc-100 line-clamp-1 leading-tight group-hover:text-white transition-colors">
                                                                {member.name}
                                                            </span>
                                                            <span className="text-xs text-zinc-500 line-clamp-1 mt-1">
                                                                {member.character || "Actor"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Subtitle Download Section */}
                {playerSubtitles && playerSubtitles.length > 0 && (
                    <div className="mt-6">
                        <SubtitleDownload
                            subtitles={playerSubtitles}
                            movieTitle={movie.title}
                            episodeName={episodeName}
                        />
                    </div>
                )}


                {/* Episodes Section - REDESIGNED */}
                {isTVShow && movie.seasons && movie.seasons.length > 0 && (
                    <div className="mt-8 rounded-2xl border border-white/5 bg-zinc-900/80 dark:bg-black/20 backdrop-blur-sm overflow-hidden">
                        {/* Header Bar */}
                        <div className="p-6 sm:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Episodes</h2>
                                <p className="text-2xl font-semibold text-white">
                                    Season {movie.seasons[currentSeasonIndex].seasonNumber}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full md:w-auto">
                                {/* Season Tabs */}
                                <div className="w-full sm:w-auto overflow-x-auto scrollbar-none">
                                    <div className="flex bg-black/40 p-1 rounded-full border border-white/5 w-fit">
                                        {movie.seasons.map((season, idx) => (
                                            <button
                                                key={season._key}
                                                onClick={() => {
                                                    setCurrentSeasonIndex(idx);
                                                    setCurrentEpisodeIndex(0);
                                                    setEpisodeSearchQuery("");
                                                }}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
                                                    currentSeasonIndex === idx
                                                        ? "bg-zinc-800 text-white shadow-md"
                                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                                                )}
                                            >
                                                Season {season.seasonNumber}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Search - hide on very small screens if only 1 season */}
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                                    <Input
                                        placeholder="Search episodes..."
                                        value={episodeSearchQuery}
                                        onChange={(e) => setEpisodeSearchQuery(e.target.value)}
                                        className="pl-9 bg-black/20 border-white/5 text-zinc-200 focus:border-white/10 focus:ring-1 focus:ring-white/10 rounded-full h-9 text-sm placeholder:text-zinc-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 sm:p-8 bg-black/10 min-h-[400px]">
                            {movie.seasons.map((season, seasonIdx) => (
                                <div key={season._key} className={cn(seasonIdx === currentSeasonIndex ? "block" : "hidden")}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {[...season.episodes]
                                            .sort((a, b) => {
                                                // Sort by match score (higher score = higher priority)
                                                const scoreA = getMatchScore(a, episodeSearchQuery);
                                                const scoreB = getMatchScore(b, episodeSearchQuery);

                                                // If scores differ, sort by score descending
                                                if (scoreA !== scoreB) return scoreB - scoreA;

                                                // If same score, maintain original episode order
                                                return (a.episodeNumber || 0) - (b.episodeNumber || 0);
                                            })
                                            .map((episode) => {
                                                const originalIndex = season.episodes.findIndex(e => e._key === episode._key);
                                                const isActive = seasonIdx === currentSeasonIndex && originalIndex === currentEpisodeIndex;
                                                const score = getMatchScore(episode, episodeSearchQuery);

                                                // Check if any episode has an exact match (score >= 75)
                                                const hasExactMatch = episodeSearchQuery.trim() !== "" &&
                                                    season.episodes.some(ep => getMatchScore(ep, episodeSearchQuery) >= 75);

                                                // Dim logic: 
                                                // - If exact match exists, dim anything below score 75
                                                // - Otherwise, dim anything with score 0
                                                const isDimmed = episodeSearchQuery.trim() !== "" &&
                                                    (hasExactMatch ? score < 75 : score === 0);

                                                return (
                                                    <div
                                                        key={episode._key}
                                                        onClick={() => !isDimmed && handleEpisodeClick(seasonIdx, originalIndex)}
                                                        className={cn(
                                                            "group relative flex gap-4 p-3 rounded-xl border transition-all duration-300 overflow-hidden",
                                                            isActive
                                                                ? "bg-white/[0.05] border-white/20 ring-1 ring-white/10"
                                                                : "bg-zinc-900/50 border-white/5 hover:bg-white/[0.03] hover:border-white/10 cursor-pointer",
                                                            isDimmed ? "opacity-30 grayscale pointer-events-none" : "opacity-100"
                                                        )}
                                                    >
                                                        {/* Thumbnail Container */}
                                                        <div className="relative w-36 aspect-video shrink-0 overflow-hidden rounded-[10px]  bg-zinc-900 shadow-lg">
                                                            {episode.thumbnail ? (
                                                                <Image
                                                                    src={urlFor(episode.thumbnail).width(300).url()}
                                                                    alt={episode.title}
                                                                    fill
                                                                    sizes="144px"
                                                                    placeholder="blur"
                                                                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAHhAAAgIBBQEAAAAAAAAAAAAAAQIDBAAFERIhMUH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ALc2n0Jb2JZtaq2Yol4JJzyYqN/fzHGpUbSG1ar2IrUkqSKHimmZlZSPCCPMYwf/2Q=="
                                                                    className={cn(
                                                                        "object-cover rounded-[8px] transition-all duration-500",
                                                                        !isDimmed && "group-hover:scale-110",
                                                                        isActive ? "opacity-40" : "opacity-80 group-hover:opacity-100"
                                                                    )}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                                                    <Play className="h-8 w-8" />
                                                                </div>
                                                            )}

                                                            {/* Playing Animation / Play Button */}
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                {isActive ? (
                                                                    <div className="flex gap-1 items-end h-4">
                                                                        <span className="w-1 h-3 bg-white animate-[music-bar_1s_ease-in-out_infinite]" />
                                                                        <span className="w-1 h-5 bg-white animate-[music-bar_1.2s_ease-in-out_infinite]" />
                                                                        <span className="w-1 h-2 bg-white animate-[music-bar_0.8s_ease-in-out_infinite]" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 border border-white/10">
                                                                        <Play className="h-3 w-3 fill-white text-white ml-0.5" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Duration */}
                                                            {episode.duration && (
                                                                <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/60 backdrop-blur-sm text-zinc-200 px-1.5 py-0.5 rounded-sm">
                                                                    {episode.duration}m
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Text Info */}
                                                        <div className="flex flex-col justify-center min-w-0 flex-1 py-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={cn(
                                                                    "text-xs font-bold uppercase tracking-wider",
                                                                    isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-400"
                                                                )}>
                                                                    Ep {episode.episodeNumber}
                                                                </span>
                                                            </div>
                                                            <h4 className={cn(
                                                                "text-sm font-semibold leading-tight mb-1.5 line-clamp-1 transition-colors",
                                                                isActive ? "text-white" : "text-zinc-300 group-hover:text-white"
                                                            )}>
                                                                {episode.title}
                                                            </h4>
                                                            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed group-hover:text-zinc-400 transition-colors">
                                                                {episode.overview || "Watch the episode to find out more"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* Comment Section */}
                <div className="mt-12 pt-12 border-t border-white/10">
                    <CommentSection
                        movieId={movie.slug?.current || movie._id}
                        onLoginClick={() => {
                            setAuthDialogOpen(true);
                        }}
                    />
                </div>

                {/* Trailer Dialog */}
                <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
                    <DialogContent className="max-w-5xl bg-zinc-950 border-zinc-800 p-0 overflow-hidden">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Trailer: {movie.title}</DialogTitle>
                        </DialogHeader>
                        <div className="w-full aspect-video">
                            {movie.trailerUrl && (
                                <iframe
                                    src={`${getYouTubeEmbedUrl(movie.trailerUrl)}?autoplay=1&rel=0`}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Auth Dialog */}
                <AuthDialog
                    open={authDialogOpen}
                    onOpenChange={setAuthDialogOpen}
                />
            </div>
        </div>
    );
}