"use client";

import { useState } from "react";
import { Download, Check, FileText, Loader2, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { PlayerSubtitle } from "@/lib/subtitleConverter";

interface SubtitleDownloadProps {
    subtitles: PlayerSubtitle[];
    movieTitle: string;
    episodeName?: string;
}

export function SubtitleDownload({ subtitles, movieTitle, episodeName }: SubtitleDownloadProps) {
    const downloadableSubtitles = subtitles.filter(sub => sub.downloadEnabled);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [downloaded, setDownloaded] = useState<string[]>([]);

    if (downloadableSubtitles.length === 0) return null;

    const handleDownload = async (subtitle: PlayerSubtitle) => {
        if (downloading) return;

        setDownloading(subtitle.language);

        try {
            // Try fetching with no-cors mode first, then fall back to regular fetch
            const response = await fetch(subtitle.url, {
                mode: 'cors',
                credentials: 'omit',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const ext = subtitle.url.endsWith('.srt') ? 'srt' : 'vtt';
            const fileName = episodeName
                ? `${movieTitle} - ${episodeName} - ${subtitle.label}.${ext}`
                : `${movieTitle} - ${subtitle.label}.${ext}`;

            link.download = fileName;

            // Artificial delay to show off the premium animation
            await new Promise(resolve => setTimeout(resolve, 1500));

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setDownloaded(prev => [...prev, subtitle.language]);
        } catch (error) {
            console.error('Download failed, trying direct link:', error);

            // Fallback: Open in new tab or use direct anchor approach
            // This works even when CORS blocks the fetch
            try {
                const link = document.createElement('a');
                link.href = subtitle.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';

                // Some browsers support download attribute for cross-origin
                const ext = subtitle.url.endsWith('.srt') ? 'srt' : 'vtt';
                const fileName = episodeName
                    ? `${movieTitle} - ${episodeName} - ${subtitle.label}.${ext}`
                    : `${movieTitle} - ${subtitle.label}.${ext}`;
                link.download = fileName;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setDownloaded(prev => [...prev, subtitle.language]);
            } catch (fallbackError) {
                console.error('Fallback download also failed:', fallbackError);
                // Last resort: open URL directly
                window.open(subtitle.url, '_blank');
            }
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="w-full mt-10">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-8 px-2"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full" />
                    <div className="h-12 w-12 relative rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-700/50 flex items-center justify-center">
                        <Download className="h-6 w-6 text-primary" />
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Available Subtitles</h3>
                    <p className="text-sm text-zinc-400 font-medium">
                        Download subtitles for <span className="text-zinc-200">{episodeName || movieTitle}</span>
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                    {downloadableSubtitles.map((subtitle, index) => {
                        const isDownloading = downloading === subtitle.language;
                        const isDownloaded = downloaded.includes(subtitle.language);
                        const isSrt = subtitle.url.endsWith('.srt');

                        return (
                            <motion.button
                                key={subtitle.language}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                onClick={() => handleDownload(subtitle)}
                                disabled={isDownloading}
                                className={cn(
                                    "group relative w-full text-left overflow-hidden rounded-2xl border transition-all duration-500",
                                    " hover:-translate-y-1",
                                    isDownloaded
                                        ? "bg-zinc-900/40 border-green-500/30"
                                        : "bg-zinc-900/40 border-zinc-800 backdrop-blur-sm"
                                )}
                            >
                                {/* Background Progress Fill Effect */}
                                {isDownloading && (
                                    <motion.div
                                        layoutId={`progress-${subtitle.language}`}
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2, ease: "easeInOut" }}
                                        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 z-0"
                                    />
                                )}

                                {/* Shine Effect on Hover (Only if not downloading/downloaded) */}
                                {!isDownloading && !isDownloaded && (
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
                                    </div>
                                )}

                                <div className="relative z-10 p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3.5">
                                        {/* File Icon Container */}
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-300",
                                            isDownloaded
                                                ? "bg-green-500/10 border-green-500/20 text-green-500"
                                                : "bg-zinc-950 border-zinc-800 text-zinc-400 group-hover:border-zinc-700 group-hover:text-zinc-200"
                                        )}>
                                            <FileText className="h-5 w-5" />
                                        </div>

                                        {/* Text Info */}
                                        <div className="flex flex-col gap-1">
                                            <span className={cn(
                                                "font-semibold text-[15px] transition-colors",
                                                isDownloaded ? "text-green-400" : "text-zinc-200 group-hover:text-white"
                                            )}>
                                                {subtitle.label}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "h-5 px-1.5 text-[10px] tracking-wider font-bold border rounded-md transition-colors",
                                                        isSrt
                                                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                            : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                                    )}
                                                >
                                                    {isSrt ? 'SRT' : 'VTT'}
                                                </Badge>
                                                {isDownloading && (
                                                    <span className="text-[10px] text-primary font-medium animate-pulse">
                                                        Fetching...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button/Status Indicator */}
                                    <div className="relative">
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center border transition-all duration-300",
                                            isDownloaded
                                                ? "bg-green-500 text-black border-green-500"
                                                : isDownloading
                                                    ? "bg-transparent border-transparent"
                                                    : "bg-zinc-800 border-zinc-700 text-zinc-400 group-hover:bg-primary group-hover:border-primary group-hover:text-black"
                                        )}>
                                            <AnimatePresence mode="wait">
                                                {isDownloading ? (
                                                    <motion.div
                                                        key="loading"
                                                        initial={{ opacity: 0, rotate: -90 }}
                                                        animate={{ opacity: 1, rotate: 0 }}
                                                        exit={{ opacity: 0, scale: 0 }}
                                                    >
                                                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                                                    </motion.div>
                                                ) : isDownloaded ? (
                                                    <motion.div
                                                        key="check"
                                                        initial={{ scale: 0, rotate: -45 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        className="flex items-center justify-center"
                                                    >
                                                        <Check className="h-5 w-5 font-bold" strokeWidth={3} />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="download"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0 }}
                                                    >
                                                        <Download className="h-5 w-5" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Circular Progress (Optional visual flair behind spinner) */}
                                        {isDownloading && (
                                            <svg className="absolute inset-0 h-10 w-10 -rotate-90 pointer-events-none">
                                                <circle
                                                    className="text-zinc-800"
                                                    strokeWidth="2"
                                                    stroke="currentColor"
                                                    fill="transparent"
                                                    r="18"
                                                    cx="20"
                                                    cy="20"
                                                />
                                                <motion.circle
                                                    className="text-primary"
                                                    strokeWidth="2"
                                                    stroke="currentColor"
                                                    fill="transparent"
                                                    r="18"
                                                    cx="20"
                                                    cy="20"
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: 1 }}
                                                    transition={{ duration: 2, ease: "easeInOut" }}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}