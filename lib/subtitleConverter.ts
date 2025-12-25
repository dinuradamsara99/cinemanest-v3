/**
 * Utility function to convert SRT subtitle format to WebVTT format
 * SRT files use format: 00:02:20,000 --> 00:02:25,000
 * VTT files use format: 00:02:20.000 --> 00:02:25.000
 * VTT files also require "WEBVTT" header at the start
 */

export async function convertSrtToVtt(srtUrl: string): Promise<string> {
    try {
        // Fetch the SRT file
        const response = await fetch(srtUrl)
        const srtContent = await response.text()

        // Convert SRT to VTT
        let vttContent = 'WEBVTT\n\n'

        // Replace comma with period in timestamps (SRT uses comma, VTT uses period)
        vttContent += srtContent.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')

        // Create a blob URL for the VTT content
        const blob = new Blob([vttContent], { type: 'text/vtt' })
        return URL.createObjectURL(blob)
    } catch (error) {
        console.error('Error converting SRT to VTT:', error)
        throw error
    }
}

/**
 * Check if a URL is an SRT file
 */
export function isSrtFile(url: string): boolean {
    return url.toLowerCase().endsWith('.srt')
}

/**
 * Check if a URL is a VTT file
 */
export function isVttFile(url: string): boolean {
    return url.toLowerCase().endsWith('.vtt')
}

/**
 * Converts Sanity subtitle data to the format expected by VideoPlayerWithSubtitles
 * @param subtitles - Array of subtitle tracks from Sanity
 * @returns Array of subtitle objects with URLs for the video player
 */
export function convertSanitySubtitlesToPlayerFormat(
    subtitles?: Array<{
        _key: string
        label: string
        language: string
        file: {
            asset: {
                _ref: string
                _type: string
                url?: string
            }
        }
        isDefault?: boolean
    }>
): Array<{
    url: string
    label: string
    language: string
    kind: 'subtitles' | 'captions' | 'descriptions'
    default?: boolean
}> {
    if (!subtitles || subtitles.length === 0) {
        return []
    }

    return subtitles.map((subtitle) => ({
        url: subtitle.file.asset.url || '',
        label: subtitle.label,
        language: subtitle.language,
        kind: 'subtitles' as const,
        default: subtitle.isDefault || false,
    }))
}

