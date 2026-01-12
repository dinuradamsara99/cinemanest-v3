"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Youtube, CheckCircle2, Film, AlertCircle, X, Video, Clapperboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { processYoutubeLink, submitRequest } from "@/app/actions/movie-request";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    movieName: z.string().min(1, "Movie name is required"),
    youtubeLink: z.string().optional().or(z.literal("")),
    notes: z.string().optional(),
});

export function RequestMovieDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const { data: session } = useSession();
    const { toast } = useToast();
    const router = useRouter();

    const [isProcessingLink, setIsProcessingLink] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastExtractedName, setLastExtractedName] = useState<string | null>(null);
    const [activeRequestCount, setActiveRequestCount] = useState<number>(0);
    const [isLoadingCount, setIsLoadingCount] = useState(true);
    const [rateLimitError, setRateLimitError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            movieName: "",
            youtubeLink: "",
            notes: "",
        },
    });

    const youtubeLinkValue = form.watch("youtubeLink");

    // When dialog is triggered, check if user is logged in
    useEffect(() => {
        if (open && !session) {
            setOpen(false);
            setShowAuthDialog(true);
        }
    }, [open, session]);

    // Fetch active request count on mount
    useEffect(() => {
        async function fetchActiveCount() {
            if (!session?.user?.id) {
                setIsLoadingCount(false);
                return;
            }

            try {
                const response = await fetch(`/api/requests/active-count?userId=${session.user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setActiveRequestCount(data.count || 0);
                }
            } catch (error) {
                console.error("Failed to fetch active count:", error);
            } finally {
                setIsLoadingCount(false);
            }
        }

        fetchActiveCount();
    }, [session]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (youtubeLinkValue && (youtubeLinkValue.includes("youtube.com") || youtubeLinkValue.includes("youtu.be"))) {
                await handleLinkAnalysis(youtubeLinkValue);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [youtubeLinkValue]);

    const handleLinkAnalysis = async (url: string) => {
        setLastExtractedName(null);

        try {
            const result = await processYoutubeLink(url);

            if (result.rateLimited) {
                setRateLimitError(result.error || "You have reached your daily YouTube AI limit (Limit: 5 times per day). Please try again tomorrow.");
                toast({
                    variant: "destructive",
                    title: "Daily Limit Reached",
                    description: result.error,
                    duration: 6000,
                });
                return;
            }

            setRateLimitError(null);
            setIsProcessingLink(true);

            await new Promise(resolve => setTimeout(resolve, 1500));

            if (result.success && result.title) {
                form.setValue("movieName", result.title, { shouldValidate: true });
                setLastExtractedName(result.title);
                toast({
                    title: "Movie Identified! 🎥",
                    description: `We found "${result.title}" from your link.`,
                    className: "bg-zinc-900 border-zinc-800 text-white"
                });
            } else if (result.error) {
                toast({
                    variant: "destructive",
                    title: "Could not identify",
                    description: result.error,
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessingLink(false);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!session) {
            setShowAuthDialog(true);
            return;
        }

        if (activeRequestCount >= 3) {
            toast({
                variant: "destructive",
                title: "Request Limit Reached",
                description: (
                    <div className="space-y-1">
                        <p>You have reached the limit of 3 active requests.</p>
                        <p className="text-sm">ඔබගේ Request එකක් Complete වුනාම Accept කරලා නැවත Request කරන්න.</p>
                    </div>
                ),
            });
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("movieName", values.movieName);
        if (values.youtubeLink) formData.append("youtubeLink", values.youtubeLink);
        if (values.notes) formData.append("notes", values.notes);

        const result = await submitRequest(null, formData);

        if (result.success) {
            toast({
                title: "Request Sent! 🚀",
                description: (
                    <div className="space-y-1">
                        <p>{result.message}</p>
                        <p className="text-sm text-zinc-300">ඔබගේ Request එක Complete වුනාම Message එකක් එයි.</p>
                    </div>
                ),
                className: "bg-green-600 text-white border-none"
            });
            form.reset();
            setLastExtractedName(null);

            setTimeout(() => {
                setOpen(false);
            }, 1000);

            setTimeout(() => {
                router.push('/account');
            }, 2000);
        } else {
            toast({
                variant: "destructive",
                title: "Failed",
                description: result.error,
            });
        }
        setIsSubmitting(false);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {children || (
                        <SidebarMenuButton tooltip="Request Movie">
                            <Video className="h-4.5 w-4.5 text-zinc-500" />
                            <span>Request Movie</span>
                        </SidebarMenuButton>
                    )}
                </DialogTrigger>
                <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] p-0 overflow-hidden border-zinc-800 bg-zinc-950 [&>button]:hidden">
                    {/* Visually hidden title for accessibility */}
                    <DialogTitle className="sr-only">Request a Movie or Show</DialogTitle>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full relative bg-zinc-950 rounded-2xl overflow-hidden"
                    >
                        {/* FULL FORM OVERLAY ANIMATION */}
                        <AnimatePresence>
                            {isProcessingLink && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/90"
                                >
                                    <div className="relative flex flex-col items-center justify-center">
                                        <div className="relative w-28 h-28 flex items-center justify-center">
                                            <div className="absolute inset-0 rounded-full border" />
                                            <motion.div
                                                className="absolute inset-0 rounded-full border-t-[1px] border-white/80 border-r-[1px] border-r-transparent border-b-transparent border-l-transparent"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                                            />
                                            <motion.div
                                                className="absolute inset-3 rounded-full border-b-[1px] border-white/30 border-t-transparent border-l-transparent border-r-transparent"
                                                animate={{ rotate: -360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            />
                                            <motion.div
                                                className="relative z-10 p-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            >
                                                <svg viewBox="0 0 24 24" className="w-10 h-10 fill-white" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000" />
                                                    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF" />
                                                </svg>
                                            </motion.div>
                                        </div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="mt-4 flex flex-col items-center space-y-1"
                                        >
                                            <span className="text-sm font-medium text-zinc-300 tracking-wider">
                                                Analyzing YouTube Content
                                            </span>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-4 sm:p-6 md:p-8 pt-4 sm:pt-5 md:pt-6 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={handleClose}
                                className="absolute top-3 right-3 p-1.5 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-all duration-200 z-10"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Header */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                                        <Clapperboard className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-white">
                                            Request a Movie or Show
                                        </h2>
                                        <p className="text-zinc-400 text-sm mt-0.5">
                                            Can't find what you're looking for? Let us know!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Limit Warning Banner */}
                            {!isLoadingCount && activeRequestCount >= 3 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                                >
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className="p-1.5 sm:p-2 bg-red-500/20 rounded-lg shrink-0">
                                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <h4 className="text-sm sm:text-base font-semibold text-red-300">Request Limit Reached</h4>
                                            <p className="text-xs sm:text-sm text-red-200/70">
                                                ඔබගේ Requests 3ක් දැනට සක්‍රීයව පවතී. නව ඉල්ලීමක් කිරීමට පෙර, කරුණාකර දැනට පවතින ඉල්ලීමක් සම්පූර්ණ වන තෙක් රැඳී සිටින්න.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* YouTube AI Rate Limit Warning Banner */}
                            {rateLimitError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 sm:mb-6 p-3 sm:p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl"
                                >
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className="p-1.5 sm:p-2 bg-orange-500/20 rounded-lg shrink-0">
                                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <h4 className="text-sm sm:text-base font-semibold text-orange-300">YouTube AI Limit Reached 🚫</h4>
                                            <p className="text-xs sm:text-sm text-orange-200/70">
                                                {rateLimitError}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">

                                    {/* YouTube Link Field */}
                                    <FormField
                                        control={form.control}
                                        name="youtubeLink"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-zinc-300 font-medium ml-1">
                                                    Paste YouTube Link <span className="text-zinc-500 text-xs font-normal">(Optional)</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative group overflow-hidden rounded-md">
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8">
                                                            <Youtube className="w-5 h-5 text-zinc-500 group-hover:text-red-500 transition-colors duration-300" />
                                                        </div>
                                                        <Input
                                                            placeholder="https://www.youtube.com/watch?v=..."
                                                            className={cn(
                                                                "pl-10 sm:pl-12 pr-3 sm:pr-4 h-10 sm:h-12 bg-zinc-900/50 border-zinc-800 text-sm sm:text-base",
                                                                "focus-visible:ring-1 focus-visible:ring-red-500/50 focus-visible:border-red-500/50",
                                                                "transition-all duration-300 text-zinc-200 placeholder:text-zinc-600"
                                                            )}
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>

                                                <div className="h-5 flex items-center ml-1">
                                                    <AnimatePresence mode="wait">
                                                        {isProcessingLink ? (
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 0 }}
                                                                className="h-full"
                                                            />
                                                        ) : lastExtractedName ? (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="flex items-center gap-2 text-xs text-green-400 font-medium"
                                                            >
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Data extracted successfully
                                                            </motion.div>
                                                        ) : (
                                                            <span className="text-xs text-zinc-600">
                                                                AI will auto-fill details from the link.
                                                            </span>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Movie Name Field */}
                                    <FormField
                                        control={form.control}
                                        name="movieName"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-zinc-300 font-medium ml-1 text-sm sm:text-base">Movie or Show Name</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Film className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                                        <Input
                                                            placeholder="e.g. Inception"
                                                            className={cn(
                                                                "pl-9 sm:pl-10 h-10 sm:h-12 bg-zinc-900/50 border-zinc-800 text-sm sm:text-base text-zinc-200 placeholder:text-zinc-600",
                                                                "focus-visible:ring-primary/20 focus-visible:border-primary/50",
                                                                lastExtractedName === field.value && "animate-pulse border-green-500/50 ring-1 ring-green-500/20"
                                                            )}
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Notes Field */}
                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-zinc-300 font-medium ml-1 text-sm sm:text-base">Additional Notes</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Specific quality (4K), year, or language?"
                                                        className="resize-none rounded-[10px] min-h-[80px] sm:min-h-[100px] bg-zinc-900/50 border-zinc-800 text-sm sm:text-base text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-primary/20 focus-visible:border-primary/50"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || isProcessingLink}
                                        className={cn(
                                            "w-full h-11 sm:h-12 text-sm sm:text-base font-medium rounded-full transition-all duration-300",
                                            "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary",
                                            "shadow-[0_0_20px_-5px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_-5px_rgba(var(--primary),0.5)]"
                                        )}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Submitting Request...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span>Submit Request</span>
                                            </div>
                                        )}
                                    </Button>

                                </form>
                            </Form>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>

            <AuthDialog
                open={showAuthDialog}
                onOpenChange={setShowAuthDialog}
            />
        </>
    );
}
