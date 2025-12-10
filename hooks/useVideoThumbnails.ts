'use client'

import { useState, useCallback, useMemo } from 'react'

export interface ThumbnailSprite {
    startTime: number
    endTime: number
    url: string
    x: number
    y: number
    width: number
    height: number
}

interface UseVideoThumbnailsReturn {
    getThumbnailForTime: (time: number) => ThumbnailSprite | null
    thumbnails: ThumbnailSprite[]
}

// Mock thumbnail data generator - replace with actual VTT/JSON parser
function generateMockThumbnails(duration: number, spriteUrl: string = '/thumbnails/sprite.jpg'): ThumbnailSprite[] {
    const sprites: ThumbnailSprite[] = []
    const thumbnailInterval = 10 // seconds per thumbnail
    const thumbnailWidth = 160
    const thumbnailHeight = 90
    const spriteCols = 10

    const totalThumbnails = Math.ceil(duration / thumbnailInterval)

    for (let i = 0; i < totalThumbnails; i++) {
        const row = Math.floor(i / spriteCols)
        const col = i % spriteCols

        sprites.push({
            startTime: i * thumbnailInterval,
            endTime: Math.min((i + 1) * thumbnailInterval, duration),
            url: spriteUrl,
            x: col * thumbnailWidth,
            y: row * thumbnailHeight,
            width: thumbnailWidth,
            height: thumbnailHeight,
        })
    }

    return sprites
}

// Parse VTT thumbnail file format
export function parseVTTThumbnails(vttContent: string, baseUrl: string = ''): ThumbnailSprite[] {
    const sprites: ThumbnailSprite[] = []
    const lines = vttContent.split('\n')

    let i = 0
    while (i < lines.length) {
        const line = lines[i].trim()

        // Look for time range line (e.g., "00:00:00.000 --> 00:00:10.000")
        const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/)

        if (timeMatch) {
            const startTime = parseVTTTime(timeMatch[1])
            const endTime = parseVTTTime(timeMatch[2])

            // Next line should be the thumbnail URL with optional sprite coordinates
            i++
            if (i < lines.length) {
                const urlLine = lines[i].trim()
                const spriteMatch = urlLine.match(/(.+?)(?:#xywh=(\d+),(\d+),(\d+),(\d+))?$/)

                if (spriteMatch) {
                    sprites.push({
                        startTime,
                        endTime,
                        url: baseUrl + spriteMatch[1],
                        x: spriteMatch[2] ? parseInt(spriteMatch[2]) : 0,
                        y: spriteMatch[3] ? parseInt(spriteMatch[3]) : 0,
                        width: spriteMatch[4] ? parseInt(spriteMatch[4]) : 160,
                        height: spriteMatch[5] ? parseInt(spriteMatch[5]) : 90,
                    })
                }
            }
        }
        i++
    }

    return sprites
}

// Parse VTT time format to seconds
function parseVTTTime(timeStr: string): number {
    const parts = timeStr.split(':')
    const hours = parseInt(parts[0])
    const minutes = parseInt(parts[1])
    const seconds = parseFloat(parts[2])
    return hours * 3600 + minutes * 60 + seconds
}

// Parse JSON thumbnail manifest
export function parseJSONThumbnails(jsonContent: { thumbnails: ThumbnailSprite[] }): ThumbnailSprite[] {
    return jsonContent.thumbnails || []
}

export function useVideoThumbnails(
    duration: number,
    thumbnailData?: ThumbnailSprite[] | string,
    thumbnailBaseUrl: string = ''
): UseVideoThumbnailsReturn {

    // Parse thumbnails if string (VTT content) is provided
    const thumbnails = useMemo(() => {
        if (!thumbnailData) {
            // Generate mock thumbnails if no data provided
            return duration > 0 ? generateMockThumbnails(duration) : []
        }

        if (typeof thumbnailData === 'string') {
            return parseVTTThumbnails(thumbnailData, thumbnailBaseUrl)
        }

        return thumbnailData
    }, [thumbnailData, thumbnailBaseUrl, duration])

    // Get thumbnail for a specific time
    const getThumbnailForTime = useCallback((time: number): ThumbnailSprite | null => {
        if (thumbnails.length === 0) return null

        // Find thumbnail that covers this time
        for (const thumb of thumbnails) {
            if (time >= thumb.startTime && time < thumb.endTime) {
                return thumb
            }
        }

        // Return last thumbnail if time exceeds all
        return thumbnails[thumbnails.length - 1] || null
    }, [thumbnails])

    return {
        getThumbnailForTime,
        thumbnails,
    }
}
