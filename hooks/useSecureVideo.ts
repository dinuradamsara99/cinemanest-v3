'use client'

import { useState, useEffect } from 'react'

interface SecureVideoState {
    blobUrl: string | null
    isLoading: boolean
    error: string | null
}

/**
 * Custom hook to provide video URL security features.
 * 
 * Note: Blob URL conversion only works for same-origin or CORS-enabled URLs.
 * For external URLs (which most streaming services are), we fall back to
 * the original URL but still provide the other security features like
 * context menu blocking and keyboard protection.
 */
export function useSecureVideo(url: string | undefined): SecureVideoState {
    const [state, setState] = useState<SecureVideoState>({
        blobUrl: null,
        isLoading: true,
        error: null,
    })

    useEffect(() => {
        if (!url) {
            setState({ blobUrl: null, isLoading: false, error: null })
            return
        }

        // For most external video URLs, CORS will block fetch requests
        // So we just use the original URL but still apply other protections
        // The Blob technique only works for same-origin or CORS-enabled servers

        // Check if it's an external/embed URL that can't be converted
        if (isExternalUrl(url)) {
            // Use original URL directly - Blob conversion won't work due to CORS
            setState({ blobUrl: url, isLoading: false, error: null })
            return
        }

        // For same-origin URLs, attempt Blob conversion
        let blobUrl: string | null = null
        const controller = new AbortController()

        const attemptBlobConversion = async () => {
            setState(prev => ({ ...prev, isLoading: true }))

            try {
                const response = await fetch(url, {
                    signal: controller.signal,
                    mode: 'cors',
                })

                if (!response.ok) {
                    throw new Error('Fetch failed')
                }

                const blob = await response.blob()
                blobUrl = URL.createObjectURL(blob)
                setState({ blobUrl, isLoading: false, error: null })
            } catch (error) {
                // Silently fall back to original URL on any error
                // This is expected for most external video hosts
                if ((error as Error).name !== 'AbortError') {
                    console.log('Using original URL (Blob conversion not available for this source)')
                    setState({ blobUrl: url, isLoading: false, error: null })
                }
            }
        }

        attemptBlobConversion()

        // Cleanup
        return () => {
            controller.abort()
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl)
            }
        }
    }, [url])

    return state
}

/**
 * Check if URL is external (different origin or known streaming service)
 */
function isExternalUrl(url: string): boolean {
    try {
        const videoUrl = new URL(url, window.location.origin)
        const currentOrigin = window.location.origin

        // If different origin, it's external
        if (videoUrl.origin !== currentOrigin) {
            return true
        }

        return false
    } catch {
        // If URL parsing fails, assume external
        return true
    }
}

/**
 * Hook to block right-click context menu
 */
export function useContextMenuBlock(elementRef: React.RefObject<HTMLElement | null>) {
    useEffect(() => {
        const element = elementRef.current
        if (!element) return

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            return false
        }

        element.addEventListener('contextmenu', handleContextMenu)

        return () => {
            element.removeEventListener('contextmenu', handleContextMenu)
        }
    }, [elementRef])
}

/**
 * Hook to block keyboard shortcuts that could reveal video source
 */
export function useKeyboardProtection(containerRef: React.RefObject<HTMLElement | null>) {
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault()
                return false
            }

            // Ctrl+Shift+I or Ctrl+Shift+J (DevTools)
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) {
                e.preventDefault()
                return false
            }

            // F12 (DevTools)
            if (e.key === 'F12') {
                e.preventDefault()
                return false
            }

            // Ctrl+S (Save)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault()
                return false
            }
        }

        container.addEventListener('keydown', handleKeyDown)

        return () => {
            container.removeEventListener('keydown', handleKeyDown)
        }
    }, [containerRef])
}

/**
 * Combined hook for all video security features
 */
export function useVideoSecurity(
    url: string | undefined,
    containerRef: React.RefObject<HTMLElement | null>
) {
    const secureVideo = useSecureVideo(url)
    useContextMenuBlock(containerRef)
    useKeyboardProtection(containerRef)

    return secureVideo
}

export default useSecureVideo
