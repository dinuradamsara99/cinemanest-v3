'use client'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import styles from './TrailerModal.module.css'

interface TrailerModalProps {
    trailerUrl: string
    isOpen: boolean
    onClose: () => void
    onTrailerEnd: () => void
    movieTitle: string
}

export default function TrailerModal({
    trailerUrl,
    isOpen,
    onClose,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onTrailerEnd: _onTrailerEnd, // Reserved for iframe video end event (not currently implemented)
    movieTitle
}: TrailerModalProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
        if (!isOpen) return

        // Add event listener for Escape key
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEscape)

        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden'

        return () => {
            window.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    // Convert YouTube/Vimeo URLs to embed format
    const getEmbedUrl = (url: string): string => {
        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = ''

            // Handle youtu.be short URLs
            if (url.includes('youtu.be/')) {
                const match = url.match(/youtu\.be\/([^?&]+)/)
                videoId = match ? match[1] : ''
            }
            // Handle youtube.com/watch URLs
            else if (url.includes('watch?v=')) {
                const match = url.match(/[?&]v=([^&]+)/)
                videoId = match ? match[1] : ''
            }
            // Handle youtube.com/embed URLs
            else if (url.includes('/embed/')) {
                const match = url.match(/\/embed\/([^?&]+)/)
                videoId = match ? match[1] : ''
            }

            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
            }
        }

        // Vimeo
        if (url.includes('vimeo.com')) {
            const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
            return `https://player.vimeo.com/video/${videoId}?autoplay=1`
        }

        // Default - assume it's already an embed URL
        return url
    }

    if (!isOpen) return null

    const embedUrl = getEmbedUrl(trailerUrl)

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close trailer">
                    <X size={24} />
                </button>

                <div className={styles.videoContainer}>
                    <iframe
                        ref={iframeRef}
                        src={embedUrl}
                        title={`${movieTitle} - Trailer`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className={styles.video}
                    />
                </div>
            </div>
        </div>
    )
}
