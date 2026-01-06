"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import {
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertCircle,
    Film,
    CalendarDays,
    LayoutList,
    Sparkles,
    PartyPopper
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect, useTransition } from "react"
import { acknowledgeCompletedRequest } from "@/app/actions/movie-request"
import { useRouter } from "next/navigation"

// Type definition for the request object
export type RequestItem = {
    _id: string
    movieName: string
    status: 'pending' | 'processing' | 'completed' | 'rejected'
    notes?: string
    _createdAt: string
}

interface RequestListClientProps {
    requests: RequestItem[]
    activeCount: number
    limit: number
}

export function RequestListClient({ requests, activeCount, limit }: RequestListClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [completedRequests, setCompletedRequests] = useState<RequestItem[]>([])
    const [currentModalRequest, setCurrentModalRequest] = useState<RequestItem | null>(null)
    const [isAcknowledging, setIsAcknowledging] = useState(false)
    const isLimitReached = activeCount >= limit

    // Find completed and rejected requests on mount
    useEffect(() => {
        const finalizedRequests = requests.filter(r => r.status === 'completed' || r.status === 'rejected')
        setCompletedRequests(finalizedRequests)

        // Show modal for the first finalized request
        if (finalizedRequests.length > 0) {
            setCurrentModalRequest(finalizedRequests[0])
        }
    }, [requests])

    // Helper to get status styles
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    color: "text-amber-500",
                    bg: "bg-amber-500/10",
                    border: "border-amber-500/20",
                    icon: Clock,
                    label: "Pending Review"
                }
            case 'processing':
                return {
                    color: "text-blue-500",
                    bg: "bg-blue-500/10",
                    border: "border-blue-500/20",
                    icon: Loader2,
                    label: "Processing",
                    animate: true
                }
            case 'completed':
                return {
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/10",
                    border: "border-emerald-500/20",
                    icon: CheckCircle2,
                    label: "Added to Library"
                }
            case 'rejected':
                return {
                    color: "text-red-500",
                    bg: "bg-red-500/10",
                    border: "border-red-500/20",
                    icon: XCircle,
                    label: "Request Declined"
                }
            default:
                return {
                    color: "text-zinc-500",
                    bg: "bg-zinc-500/10",
                    border: "border-zinc-500/20",
                    icon: Film,
                    label: "Unknown"
                }
        }
    }

    const handleAcknowledge = async () => {
        if (!currentModalRequest) return

        setIsAcknowledging(true)

        startTransition(async () => {
            const result = await acknowledgeCompletedRequest(currentModalRequest._id)

            if (result.success) {
                // Remove from completed requests array
                const remaining = completedRequests.filter(r => r._id !== currentModalRequest._id)
                setCompletedRequests(remaining)

                // Close current modal and show next if exists
                setCurrentModalRequest(remaining.length > 0 ? remaining[0] : null)

                // Refresh the page data
                router.refresh()
            } else {
                console.error("Failed to acknowledge request:", result.error)
                // You could add a toast notification here
            }

            setIsAcknowledging(false)
        })
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-full mb-7 max-w-4xl mx-auto bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-hidden flex flex-col"
            >
                {/* Header Section */}
                <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-zinc-800/50 relative">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 shrink-0">
                                <LayoutList className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-zinc-100">Your Requests</h2>
                                <p className="text-xs text-zinc-400 hidden sm:block">Track status of your submissions</p>
                            </div>
                        </div>

                        {/* Limit Badge */}
                        <div className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-2 self-start sm:self-auto",
                            isLimitReached
                                ? "bg-red-500/10 border-red-500/20 text-red-400"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400"
                        )}>
                            {isLimitReached ? <AlertCircle className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
                            <span>{activeCount} / {limit} Active Slots</span>
                        </div>
                    </div>

                    {/* Progress Bar for Limit */}
                    <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(activeCount / limit) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={cn(
                                "h-full rounded-full",
                                isLimitReached ? "bg-red-500" : "bg-primary"
                            )}
                        />
                    </div>
                </div>

                {/* List Section */}
                <ScrollArea className="flex-1 p-3 sm:p-4 h-[350px] sm:h-[450px]">
                    {requests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 px-4">
                            <div className="p-4 rounded-full bg-zinc-900/50 border border-zinc-800">
                                <Film className="w-8 h-8 text-zinc-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-zinc-300 font-medium">No requests found</p>
                                <p className="text-sm text-zinc-500 max-w-[250px]">
                                    Submit a movie or TV show to track its progress here.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 sm:space-y-3 pb-4">
                            <AnimatePresence mode="popLayout">
                                {requests.map((req, index) => {
                                    const status = getStatusConfig(req.status)
                                    const Icon = status.icon

                                    return (
                                        <motion.div
                                            key={req._id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group relative p-3 sm:p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900/50 hover:border-zinc-700/50 transition-all duration-300"
                                        >
                                            <div className="flex items-start justify-between gap-3 sm:gap-4">
                                                <div className="space-y-1.5 flex-1 min-w-0">
                                                    <h3 className="font-semibold text-sm sm:text-base text-zinc-200 group-hover:text-primary transition-colors truncate">
                                                        {req.movieName}
                                                    </h3>

                                                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-zinc-500 flex-wrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <CalendarDays className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                            {new Date(req._createdAt).toLocaleDateString(undefined, {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </div>
                                                        {req.notes && (
                                                            <span className="max-w-[120px] sm:max-w-[200px] truncate opacity-70 border-l border-zinc-800 pl-2 sm:pl-3">
                                                                "{req.notes}"
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <Badge variant="outline" className={cn(
                                                    "shrink-0 flex items-center gap-1.5 py-1 px-2 sm:px-2.5 transition-colors duration-300 text-xs",
                                                    status.bg, status.color, status.border
                                                )}>
                                                    <Icon className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5", status.animate && "animate-spin")} />
                                                    <span className="hidden sm:inline">{status.label}</span>
                                                </Badge>
                                            </div>

                                            {/* Decoration Glow */}
                                            <div className={cn(
                                                "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500",
                                                "bg-gradient-to-r from-transparent via-white/5 to-transparent"
                                            )} />
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </ScrollArea>
            </motion.div>

            {/* Completion Acknowledgment Modal */}
            <Dialog open={currentModalRequest !== null} onOpenChange={(open) => {
                if (!open && !isAcknowledging) {
                    setCurrentModalRequest(null)
                }
            }}>
                <DialogContent className="sm:max-w-[500px] bg-zinc-950/95 backdrop-blur-xl border-zinc-800/50">
                    <DialogHeader className="space-y-4">
                        <div className="flex justify-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", duration: 0.6 }}
                                className={cn(
                                    "p-4 rounded-full border",
                                    currentModalRequest?.status === 'completed'
                                        ? "bg-emerald-500/10 border-emerald-500/20"
                                        : "bg-red-500/10 border-red-500/20"
                                )}
                            >
                                {currentModalRequest?.status === 'completed' ? (
                                    <PartyPopper className="w-12 h-12 text-emerald-500" />
                                ) : (
                                    <XCircle className="w-12 h-12 text-red-500" />
                                )}
                            </motion.div>
                        </div>

                        <DialogTitle className="text-2xl text-center font-bold text-zinc-100">
                            {currentModalRequest?.status === 'completed'
                                ? "Request Completed! 🎉"
                                : "Request Declined"}
                        </DialogTitle>

                    </DialogHeader>

                    <div className="space-y-4 px-6">
                        <div className="text-zinc-300 text-lg font-medium text-center">
                            "{currentModalRequest?.movieName}"
                        </div>
                        <p className="text-zinc-400 text-sm text-center">
                            {currentModalRequest?.status === 'completed'
                                ? "has been added to our library and is now available to watch!"
                                : "Unfortunately, this request could not be fulfilled at this time. Thank you for your understanding."}
                        </p>
                        <div className={cn(
                            "flex items-center justify-center gap-2 text-sm",
                            currentModalRequest?.status === 'completed'
                                ? "text-emerald-500/80"
                                : "text-red-500/80"
                        )}>
                            <Sparkles className="w-4 h-4" />
                            <span>Click accept to remove from your requests</span>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">

                        <Button
                            onClick={handleAcknowledge}
                            disabled={isAcknowledging}
                            className={cn(
                                "w-full text-white font-semibold",
                                currentModalRequest?.status === 'completed'
                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                    : "bg-zinc-700 hover:bg-zinc-600"
                            )}
                        >
                            {isAcknowledging ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Acknowledging...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Accept & Remove
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
