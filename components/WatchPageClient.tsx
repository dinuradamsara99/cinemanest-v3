"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, Play, Info, Search } from "lucide-react";
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
    const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0);
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
    const [episodeSearchQuery, setEpisodeSearchQuery] = useState("");
    const [trailerOpen, setTrailerOpen] = useState(false);
    const [authDialogOpen, setAuthDialogOpen] = useState(false);

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
    let currentSubtitles: SubtitleTrack[] | undefined;
    let currentTitle = movie.title;
    let episodeName: string | undefined;
    let posterUrl: string | undefined;

    if (isTVShow && movie.seasons && movie.seasons.length > 0) {
        const currentSeason = movie.seasons[currentSeasonIndex];
        if (currentSeason && currentSeason.episodes && currentSeason.episodes.length > 0) {
            const currentEpisode = currentSeason.episodes[currentEpisodeIndex];
            currentVideoUrl = currentEpisode.videoUrl;
            currentSubtitles = currentEpisode.subtitles;
            currentTitle = `${movie.title} - S${currentSeason.seasonNumber}E${currentEpisode.episodeNumber}: ${currentEpisode.title}`;
            episodeName = `S${currentSeason.seasonNumber}E${currentEpisode.episodeNumber}: ${currentEpisode.title}`;

            // Use episode thumbnail if available, fallback to movie poster
            if (currentEpisode.thumbnail?.asset) {
                posterUrl = urlFor(currentEpisode.thumbnail).width(1280).height(720).url();
            } else if (movie.posterImage?.asset) {
                posterUrl = urlFor(movie.posterImage).width(1280).height(720).url();
            }
        }
    } else {
        currentVideoUrl = movie.videoUrl;
        currentSubtitles = movie.subtitles;

        // Use movie poster for movies
        if (movie.posterImage?.asset) {
            posterUrl = urlFor(movie.posterImage).width(1280).height(720).url();
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
            "doodstream", "streamtape", "mixdrop", "voe.sx"
        ];
        return embedDomains.some((domain) => url.toLowerCase().includes(domain));
    };

    const isEmbed = currentVideoUrl ? isEmbedUrl(currentVideoUrl) : false;

    // Handle episode click
    const handleEpisodeClick = (seasonIdx: number, episodeIdx: number) => {
        setCurrentSeasonIndex(seasonIdx);
        setCurrentEpisodeIndex(episodeIdx);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };



    // Helper Function: Check if an episode matches the search query
    const checkMatch = (ep: any, query: string) => {
        const lowerQuery = query.toLowerCase().trim();
        if (!lowerQuery) return true;

        const matchesTitle = ep.title?.toLowerCase().includes(lowerQuery);
        const matchesOverview = ep.overview?.toLowerCase().includes(lowerQuery);
        const epNumString = ep.episodeNumber?.toString() || "";
        const matchesNumber = epNumString === lowerQuery || epNumString.includes(lowerQuery);

        return matchesTitle || matchesOverview || matchesNumber;
    };

    return (
        <div className="relative min-h-screen bg-[#121212] text-zinc-100">
            {/* SEO: JSON-LD Structured Data */}
            <MovieSchema movie={movie} />

            {/* Ambient Background Glow */}
            {movie.posterImage?.asset && (
                <div className="absolute top-0 left-0 w-full h-[80vh] overflow-hidden pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[#121212] z-10" />
                    <Image
                        src={urlFor(movie.posterImage).width(1200).url()}
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
                        {currentVideoUrl ? (
                            isEmbed ? (
                                <iframe
                                    src={currentVideoUrl}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title={currentTitle}
                                />
                            ) : (
                                <CustomVideoPlayer
                                    key={currentVideoUrl}
                                    videoUrl={currentVideoUrl}
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
                                    {movie.duration && !isTVShow && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                            <span>{movie.duration}m</span>
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
                                    <p className="text-zinc-300 text-lg leading-9 mt-2">
                                        {movie.description}
                                    </p>
                                )}

                                {/* Extra Details - Below Description */}
                                <div className="flex flex-col gap-6 text-sm text-zinc-400 bg-zinc-900/30 p-6 rounded-xl border border-white/5 mt-4">
                                    <div>
                                        <span className="block text-zinc-500 mb-1">Credits</span>
                                        <span className="text-zinc-200">{movie.credit || "Not listed"}</span>
                                    </div>
                                    <div>
                                        <span className="block text-zinc-500 mb-1">Original Language</span>
                                        <span className="text-zinc-200">{movie.language?.title || "English"}</span>
                                    </div>
                                    <div>
                                        <span className="block text-zinc-500 mb-2">Genres</span>
                                        <div className="flex flex-wrap gap-2">
                                            {movie.genre?.map((g) => (
                                                <Badge key={g} variant="outline" className="text-zinc-300 border-zinc-700">
                                                    {g}
                                                </Badge>
                                            ))}
                                            {movie.categories?.map((cat) => (
                                                <Badge key={cat._id} variant="outline" className="text-zinc-300 border-zinc-700">
                                                    {cat.title}
                                                </Badge>
                                            ))}
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
                    </div>

                    {/* Episodes Section (TV Only) */}
                    {isTVShow && movie.seasons && movie.seasons.length > 0 && (
                        <div className="mt-4 pt-8 border-t border-white/10">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-semibold text-white">Episodes</h2>
                                    <span className="text-sm text-zinc-500 hidden sm:inline-block">
                                        {movie.seasons.length} Season{movie.seasons.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                    <Input
                                        placeholder="Search by episode number...."
                                        value={episodeSearchQuery}
                                        onChange={(e) => setEpisodeSearchQuery(e.target.value)}
                                        className="pl-9 bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:border-zinc-700 focus:ring-0 rounded-full h-9"
                                    />
                                </div>
                            </div>

                            <Tabs
                                defaultValue={`season-${currentSeasonIndex}`}
                                onValueChange={(val) => {
                                    setCurrentSeasonIndex(parseInt(val.replace("season-", "")));
                                    setCurrentEpisodeIndex(0);
                                    setEpisodeSearchQuery("");
                                }}
                                className="w-full"
                            >
                                <ScrollArea className="w-full pb-4">
                                    <TabsList className="bg-transparent p-0 h-auto gap-4">
                                        {movie.seasons.map((season, idx) => (
                                            <TabsTrigger
                                                key={season._key}
                                                value={`season-${idx}`}
                                                className="data-[state=active]:bg-white data-[state=active]:text-black bg-zinc-900 text-zinc-400 border border-zinc-800 px-6 py-2 rounded-full transition-all"
                                            >
                                                Season {season.seasonNumber}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </ScrollArea>

                                {movie.seasons.map((season, seasonIdx) => (
                                    <TabsContent key={season._key} value={`season-${seasonIdx}`} className="mt-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {/* Sorting & Filtering Logic:
                                                1. Copy array to avoid mutating original
                                                2. Sort so matches come FIRST
                                            */}
                                            {[...season.episodes]
                                                .sort((a, b) => {
                                                    const matchA = checkMatch(a, episodeSearchQuery);
                                                    const matchB = checkMatch(b, episodeSearchQuery);
                                                    // If A is a match and B is not, A comes first (-1)
                                                    if (matchA && !matchB) return -1;
                                                    // If B is a match and A is not, B comes first (1)
                                                    if (!matchA && matchB) return 1;
                                                    // Otherwise keep original order based on episode number
                                                    return 0;
                                                })
                                                .map((episode) => {
                                                    const originalIndex = season.episodes.findIndex(e => e._key === episode._key);
                                                    const isActive = seasonIdx === currentSeasonIndex && originalIndex === currentEpisodeIndex;
                                                    const isMatch = checkMatch(episode, episodeSearchQuery);

                                                    // If searching, dim non-matches
                                                    const isDimmed = episodeSearchQuery.trim() !== "" && !isMatch;

                                                    return (
                                                        <div
                                                            key={episode._key}
                                                            onClick={() => !isDimmed && handleEpisodeClick(seasonIdx, originalIndex)}
                                                            className={cn(
                                                                "group relative flex flex-col gap-3 p-3  rounded-[20px] border transition-all duration-200",
                                                                // Active State
                                                                isActive
                                                                    ? "bg-zinc-900 border-zinc-700 "
                                                                    : "bg-zinc-900/40 border-transparent",
                                                                // Hover State (Only if not dimmed)
                                                                !isDimmed && !isActive && "hover:bg-zinc-800 hover:border-zinc-700 cursor-pointer",
                                                                // Dimmed State
                                                                isDimmed ? "opacity-30 cursor-default grayscale" : "opacity-100"
                                                            )}
                                                        >
                                                            {/* Thumbnail */}
                                                            <div className="relative aspect-video rounded-[10px] overflow-hidden border ">
                                                                {episode.thumbnail ? (
                                                                    <Image
                                                                        src={urlFor(episode.thumbnail).width(400).url()}
                                                                        alt={episode.title}
                                                                        fill
                                                                        className={cn(
                                                                            "object-cover transition-transform duration-500",
                                                                            !isDimmed && "group-hover:scale-105",
                                                                            isActive ? "opacity-30" : "opacity-80 group-hover:opacity-100"
                                                                        )}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Play className="h-8 w-8 text-zinc-700" />
                                                                    </div>
                                                                )}

                                                                {/* Playing Indicator */}
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    {isActive ? (
                                                                        <div className="flex gap-1 items-end h-4">
                                                                            <span className="w-1 h-4 bg-white animate-[music-bar_1s_ease-in-out_infinite]" />
                                                                            <span className="w-1 h-2 bg-white animate-[music-bar_1.2s_ease-in-out_infinite]" />
                                                                            <span className="w-1 h-3 bg-white animate-[music-bar_0.8s_ease-in-out_infinite]" />
                                                                        </div>
                                                                    ) : (
                                                                        !isDimmed && (
                                                                            <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100">
                                                                                <Play className="h-4 w-4 fill-white text-white ml-0.5" />
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>

                                                                {/* Duration Badge */}
                                                                {episode.duration && (
                                                                    <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded">
                                                                        {episode.duration}m
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Info */}
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className={cn(
                                                                        "text-lg font-semibold line-clamp-1",
                                                                        isActive ? "text-white" : "text-zinc-200",
                                                                        !isDimmed && !isActive && "group-hover:text-white"
                                                                    )}>
                                                                        {episode.episodeNumber}. {episode.title}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                                                                    {episode.overview || "Watch the episode to find out more"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
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

                </div>
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
    );
}