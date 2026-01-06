"use client"

import { useEffect, useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { PartyPopper, XCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { acknowledgeCompletedRequest } from "@/app/actions/movie-request"

type RequestItem = {
    _id: string
    movieName: string
    status: 'pending' | 'processing' | 'completed' | 'rejected'
    notes?: string
    _createdAt: string
}

export function GlobalRequestNotifications() {
    const router = useRouter()
    const pathname = usePathname()
    const { data: session, status } = useSession()
    const [isPending, startTransition] = useTransition()
    const [finalizedRequests, setFinalizedRequests] = useState<RequestItem[]>([])
    const [currentModalRequest, setCurrentModalRequest] = useState<RequestItem | null>(null)
    const [isAcknowledging, setIsAcknowledging] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch finalized requests for the logged-in user
    useEffect(() => {
        async function fetchFinalizedRequests() {
            if (status === "loading") return

            if (!session?.user?.id) {
                setIsLoading(false)
                return
            }

            try {
                const response = await fetch(`/api/requests/finalized?userId=${session.user.id}`)
                if (response.ok) {
                    const data = await response.json()
                    setFinalizedRequests(data)

                    // Show modal for the first finalized request
                    if (data.length > 0) {
                        setCurrentModalRequest(data[0])
                    }
                }
            } catch (error) {
                console.error("Failed to fetch finalized requests:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchFinalizedRequests()
    }, [session, status, pathname]) // Re-check when navigating to different pages

    const handleAcknowledge = async () => {
        if (!currentModalRequest) return

        setIsAcknowledging(true)

        startTransition(async () => {
            const result = await acknowledgeCompletedRequest(currentModalRequest._id)

            if (result.success) {
                // Remove from finalized requests array
                const remaining = finalizedRequests.filter(r => r._id !== currentModalRequest._id)
                setFinalizedRequests(remaining)

                // Close current modal and show next if exists
                setCurrentModalRequest(remaining.length > 0 ? remaining[0] : null)

                // Refresh the page data
                router.refresh()
            } else {
                console.error("Failed to acknowledge request:", result.error)
            }

            setIsAcknowledging(false)
        })
    }

    // Don't render anything if loading or not logged in
    if (isLoading || !session) {
        return null
    }

    return (
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
    )
}
