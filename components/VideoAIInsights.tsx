"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, ArrowUp, Info, Bot, X, PlayCircle, Film } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { AnimatePresence, motion } from "framer-motion";

interface Episode {
    episodeNumber: number;
    title: string;
    seasonNumber?: number;
}

interface VideoAIInsightsProps {
    movieTitle: string;
    movieDescription?: string;
    isTVShow?: boolean;
    episodes?: Episode[];
}

const SUGGESTED_QUESTIONS = [
    "කතාව කෙටියෙන් කියන්න",
    "Cast එකේ ඉන්නේ කවුද?",
    "IMDb Rating එක කීයද?",
    "Director කවුද?",
    "Main Villain කවුද?",
    "බලන්න වටිනවද?",
];

export function VideoAIInsights({ movieTitle, movieDescription, isTVShow = false, episodes = [] }: VideoAIInsightsProps) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Mention system state
    const [showMentions, setShowMentions] = useState(false);
    const [mentionSearch, setMentionSearch] = useState("");
    const [cursorPosition, setCursorPosition] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Detect @ trigger
    useEffect(() => {
        const text = question.slice(0, cursorPosition);
        const lastAtIndex = text.lastIndexOf("@");

        if (lastAtIndex !== -1 && isTVShow && episodes.length > 0) {
            const textAfterAt = text.slice(lastAtIndex + 1);
            // If there is no space after @, assume user is searching for episode
            if (!textAfterAt.includes(" ")) {
                setMentionSearch(textAfterAt.toLowerCase());
                setShowMentions(true);
                return;
            }
        }
        setShowMentions(false);
    }, [question, cursorPosition, isTVShow, episodes.length]);

    // Filter episodes
    const filteredEpisodes = episodes.filter((ep) => {
        const searchText = mentionSearch.toLowerCase();
        return (
            ep.title.toLowerCase().includes(searchText) ||
            ep.episodeNumber.toString().includes(searchText)
        );
    });

    const handleEpisodeSelect = (episode: Episode) => {
        const text = question.slice(0, cursorPosition);
        const lastAtIndex = text.lastIndexOf("@");

        if (lastAtIndex !== -1) {
            const beforeAt = question.slice(0, lastAtIndex);
            const afterCursor = question.slice(cursorPosition);
            const mention = `@Episode ${episode.episodeNumber}: ${episode.title} `;

            const newText = beforeAt + mention + afterCursor;
            const newPos = beforeAt.length + mention.length;

            setQuestion(newText);
            setCursorPosition(newPos); // CRITICAL FIX: Update cursor position state immediately
            setShowMentions(false);    // Force close the menu

            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.setSelectionRange(newPos, newPos);
                }
            }, 0);
        }
    };

    const handleAskQuestion = async (userQuestion: string) => {
        if (!userQuestion.trim()) return;

        setIsLoading(true);
        setError("");
        setAnswer("");

        try {
            const response = await fetch("/api/ai-insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: userQuestion,
                    movieTitle,
                    movieDescription,
                    isTVShow,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to get insights");
            }

            setAnswer(data.answer);
            setQuestion("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestedQuestion = (suggestedQ: string) => {
        setQuestion(suggestedQ);
        handleAskQuestion(suggestedQ);
    };

    return (
        <Card className="w-full relative overflow-visible bg-black/40 backdrop-blur-xl border-white/10 rounded-[24px] shadow-2xl ring-1 ring-white/5">

            {/* Background Wrapper */}
            <div className="absolute inset-0 overflow-hidden rounded-[24px] pointer-events-none z-0">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl" />
            </div>

            <CardHeader className="pb-2 pt-6 px-6 relative z-10">
                <CardTitle className="flex items-center gap-2.5 text-white/90 text-lg  pb-3 font-medium tracking-tight">

                    {isTVShow ? "TV Series Insights" : "Movie Insights"}
                    {isLoading && (
                        <span className="flex h-2 w-2 ml-2">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 px-6 pb-6 relative z-10">

                {/* Answer Area */}
                <AnimatePresence mode="wait">
                    {answer && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-zinc-900/50 rounded-2xl p-5 border border-white/5 shadow-inner relative"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setAnswer("")}
                                className="absolute top-2 right-2 h-7 w-7 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-all"
                            >
                                <X className="h-4 w-4" />
                            </Button>

                            <div className="flex gap-3 pr-6">
                                <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed">
                                    {answer}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error State */}
                <AnimatePresence>
                    {error && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl border border-red-500/20 flex items-center gap-2"
                        >
                            <Info className="h-4 w-4" /> {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading Skeleton */}
                {isLoading && (
                    <div className="space-y-3 p-2">
                        <div className="flex gap-3">
                            <Skeleton className="h-8 w-8 rounded-full bg-zinc-800" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-[90%] bg-zinc-800/60" />
                                <Skeleton className="h-4 w-[75%] bg-zinc-800/60" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="space-y-3">
                    {/* Suggested Chips */}
                    {!answer && !isLoading && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {SUGGESTED_QUESTIONS.map((sq, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="cursor-pointer bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border-white/5 px-3 py-3 transition-all duration-300 text-xs font-normal"
                                    onClick={() => handleSuggestedQuestion(sq)}
                                >
                                    {sq}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="relative group">
                        {/* Mention Popover */}
                        <AnimatePresence>
                            {showMentions && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute bottom-full left-0 right-0 mb-3 z-50 w-full"
                                >
                                    <div className="relative bg-[#0F0F10]/95 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-xl overflow-hidden ring-1 ring-black/50">

                                        <div className="px-3 py-2 border-b border-white/5 bg-[#0F0F10]/95 flex items-center gap-2">
                                            <Film className="w-3 h-3 text-indigo-400" />
                                            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Select Episode</span>
                                        </div>

                                        <Command className="bg-[#0F0F10]/95">
                                            <CommandList className="max-h-[220px] overflow-y-auto py-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
                                                <CommandEmpty className="py-6 text-center text-xs text-zinc-500">
                                                    No episodes found matching "{mentionSearch}"
                                                </CommandEmpty>

                                                <CommandGroup>
                                                    {filteredEpisodes.map((episode) => (
                                                        <CommandItem
                                                            key={episode.episodeNumber}
                                                            value={`${episode.title}-${episode.episodeNumber}`} // Unique value
                                                            onSelect={() => handleEpisodeSelect(episode)}
                                                            className="cursor-pointer mx-1 my-0.5 rounded-lg px-3 py-2.5 data-[selected=true]:bg-indigo-600/10 data-[selected=true]:border-indigo-500/20 border border-transparent transition-all duration-200 group/item"
                                                        >
                                                            <div className="flex items-center gap-3 w-full">
                                                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-zinc-800/50 flex items-center justify-center group-data-[selected=true]/item:bg-indigo-500/20 transition-colors">
                                                                    <PlayCircle className="w-4 h-4 text-zinc-400 group-data-[selected=true]/item:text-indigo-400" />
                                                                </div>

                                                                <div className="flex flex-col flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[11px] font-semibold text-indigo-400 group-data-[selected=true]/item:text-indigo-300">
                                                                            EP {episode.episodeNumber}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-sm text-zinc-200 font-medium truncate group-data-[selected=true]/item:text-white">
                                                                        {episode.title}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input Field */}
                        <div className="relative flex items-center bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all duration-300 shadow-lg">
                            <Input
                                ref={inputRef}
                                placeholder={isTVShow ? "Type @ for episodes or ask anything..." : "Ask AI about this movie..."}
                                value={question}
                                onChange={(e) => {
                                    setQuestion(e.target.value);
                                    setCursorPosition(e.target.selectionStart || 0);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !showMentions) {
                                        handleAskQuestion(question);
                                    }
                                }}
                                onClick={(e) => {
                                    setCursorPosition(e.currentTarget.selectionStart || 0);
                                }}
                                className="bg-transparent border-none text-white placeholder:text-zinc-500 h-14 pl-4 pr-12 rounded-2xl focus-visible:ring-0 text-[15px]"
                                disabled={isLoading}
                            />

                            <AnimatePresence>
                                {question.trim().length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5, x: 20 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.5, x: 20 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        className="absolute right-2"
                                    >
                                        <Button
                                            size="icon"
                                            onClick={() => handleAskQuestion(question)}
                                            disabled={isLoading}
                                            className="h-9 w-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 transition-all"
                                        >
                                            {isLoading ? (
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
                                            )}
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {isTVShow && !showMentions && episodes.length > 0 && (
                        <div className="flex justify-between items-center px-1">
                            <p className="text-[14px] text-zinc-600 ">
                                Hint: Use <span className="text-indigo-400 font-semibold">@</span> to filter episodes
                            </p>
                            <span className="text-[14px] text-zinc-700 ">AI can make mistakes check important info</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}