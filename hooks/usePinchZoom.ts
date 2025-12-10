'use client'

import { useState, useEffect, useCallback, useRef, RefObject } from 'react'

interface ZoomState {
    scale: number
    originX: number
    originY: number
    translateX: number
    translateY: number
}

interface UsePinchZoomReturn {
    zoomState: ZoomState
    handleWheel: (e: WheelEvent) => void
    handleTouchStart: (e: TouchEvent) => void
    handleTouchMove: (e: TouchEvent) => void
    handleTouchEnd: () => void
    handleMouseDown: (e: MouseEvent) => void
    handleMouseMove: (e: MouseEvent) => void
    handleMouseUp: () => void
    resetZoom: () => void
    isZoomed: boolean
}

const MIN_SCALE = 1
const MAX_SCALE = 4

export function usePinchZoom(containerRef: RefObject<HTMLDivElement | null>): UsePinchZoomReturn {
    const [zoomState, setZoomState] = useState<ZoomState>({
        scale: 1,
        originX: 50,
        originY: 50,
        translateX: 0,
        translateY: 0,
    })

    const [isDragging, setIsDragging] = useState(false)
    const lastPinchDistance = useRef<number | null>(null)
    const lastTouchCenter = useRef<{ x: number; y: number } | null>(null)
    const dragStart = useRef<{ x: number; y: number; translateX: number; translateY: number } | null>(null)

    // Calculate distance between two touch points
    const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
        const dx = touch1.clientX - touch2.clientX
        const dy = touch1.clientY - touch2.clientY
        return Math.sqrt(dx * dx + dy * dy)
    }

    // Calculate center point between two touches
    const getTouchCenter = (touch1: Touch, touch2: Touch): { x: number; y: number } => {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2,
        }
    }

    // Clamp translate values to keep content visible
    const clampTranslate = useCallback((tx: number, ty: number, scale: number) => {
        if (!containerRef.current) return { translateX: tx, translateY: ty }

        const container = containerRef.current
        const rect = container.getBoundingClientRect()
        const maxTranslateX = (rect.width * (scale - 1)) / 2
        const maxTranslateY = (rect.height * (scale - 1)) / 2

        return {
            translateX: Math.max(-maxTranslateX, Math.min(maxTranslateX, tx)),
            translateY: Math.max(-maxTranslateY, Math.min(maxTranslateY, ty)),
        }
    }, [containerRef])

    // Handle mouse wheel zoom (desktop - Ctrl + wheel)
    const handleWheel = useCallback((e: WheelEvent) => {
        if (!e.ctrlKey) return
        e.preventDefault()

        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        setZoomState(prev => {
            const delta = e.deltaY > 0 ? 0.9 : 1.1
            const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * delta))

            if (newScale === MIN_SCALE) {
                return { scale: 1, originX: 50, originY: 50, translateX: 0, translateY: 0 }
            }

            return {
                ...prev,
                scale: newScale,
                originX: x,
                originY: y,
            }
        })
    }, [containerRef])

    // Handle touch start (pinch zoom)
    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault()
            const distance = getTouchDistance(e.touches[0], e.touches[1])
            const center = getTouchCenter(e.touches[0], e.touches[1])
            lastPinchDistance.current = distance
            lastTouchCenter.current = center
        } else if (e.touches.length === 1 && zoomState.scale > 1) {
            // Start panning with single touch when zoomed
            const touch = e.touches[0]
            dragStart.current = {
                x: touch.clientX,
                y: touch.clientY,
                translateX: zoomState.translateX,
                translateY: zoomState.translateY,
            }
            setIsDragging(true)
        }
    }, [zoomState.scale, zoomState.translateX, zoomState.translateY])

    // Handle touch move (pinch zoom + pan)
    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (e.touches.length === 2 && lastPinchDistance.current !== null) {
            e.preventDefault()
            const distance = getTouchDistance(e.touches[0], e.touches[1])
            const center = getTouchCenter(e.touches[0], e.touches[1])
            const scaleFactor = distance / lastPinchDistance.current

            const container = containerRef.current
            if (!container) return

            const rect = container.getBoundingClientRect()
            const x = ((center.x - rect.left) / rect.width) * 100
            const y = ((center.y - rect.top) / rect.height) * 100

            setZoomState(prev => {
                const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * scaleFactor))

                if (newScale === MIN_SCALE) {
                    return { scale: 1, originX: 50, originY: 50, translateX: 0, translateY: 0 }
                }

                return {
                    ...prev,
                    scale: newScale,
                    originX: x,
                    originY: y,
                }
            })

            lastPinchDistance.current = distance
            lastTouchCenter.current = center
        } else if (e.touches.length === 1 && isDragging && dragStart.current) {
            e.preventDefault()
            const touch = e.touches[0]
            const dx = touch.clientX - dragStart.current.x
            const dy = touch.clientY - dragStart.current.y

            const clamped = clampTranslate(
                dragStart.current.translateX + dx,
                dragStart.current.translateY + dy,
                zoomState.scale
            )

            setZoomState(prev => ({
                ...prev,
                ...clamped,
            }))
        }
    }, [containerRef, isDragging, zoomState.scale, clampTranslate])

    // Handle touch end
    const handleTouchEnd = useCallback(() => {
        lastPinchDistance.current = null
        lastTouchCenter.current = null
        setIsDragging(false)
        dragStart.current = null
    }, [])

    // Handle mouse down for panning (desktop)
    const handleMouseDown = useCallback((e: MouseEvent) => {
        if (zoomState.scale <= 1) return
        e.preventDefault()
        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            translateX: zoomState.translateX,
            translateY: zoomState.translateY,
        }
        setIsDragging(true)
    }, [zoomState.scale, zoomState.translateX, zoomState.translateY])

    // Handle mouse move for panning
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !dragStart.current) return

        const dx = e.clientX - dragStart.current.x
        const dy = e.clientY - dragStart.current.y

        const clamped = clampTranslate(
            dragStart.current.translateX + dx,
            dragStart.current.translateY + dy,
            zoomState.scale
        )

        setZoomState(prev => ({
            ...prev,
            ...clamped,
        }))
    }, [isDragging, zoomState.scale, clampTranslate])

    // Handle mouse up
    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
        dragStart.current = null
    }, [])

    // Reset zoom to default
    const resetZoom = useCallback(() => {
        setZoomState({
            scale: 1,
            originX: 50,
            originY: 50,
            translateX: 0,
            translateY: 0,
        })
    }, [])

    return {
        zoomState,
        handleWheel,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        resetZoom,
        isZoomed: zoomState.scale > 1,
    }
}
