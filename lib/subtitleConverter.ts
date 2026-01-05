import { getFileUrl } from './sanity';

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
 * Subtitle track interface for Sanity CMS
 */
export interface SanitySubtitle {
    _key: string;
    label: string;
    language: string;
    file: {
        asset: {
            _ref: string;
            _type?: string;
            url?: string;
        };
    };
    isDefault?: boolean;
    downloadEnabled?: boolean;
}

/**
 * Clean subtitle format for the video player
 */
export interface PlayerSubtitle {
    url: string;
    label: string;
    language: string;
    kind: 'subtitles' | 'captions';
    default: boolean;
    downloadEnabled?: boolean;
}

/**
 * Converts Sanity subtitle data to the format expected by VideoPlayerWithSubtitles
 * 
 * This utility handles:
 * - Converting Sanity asset references to CDN URLs using getFileUrl helper
 * - Formatting subtitle metadata for HTML5 video track elements
 * - Setting default subtitle tracks
 * - Filtering out invalid subtitle entries
 * 
 * @param subtitles - Array of Sanity subtitle objects
 * @returns Array of formatted subtitle objects ready for the video player
 */
export function convertSanitySubtitlesToPlayerFormat(
    subtitles?: SanitySubtitle[]
): PlayerSubtitle[] {
    if (!subtitles || subtitles.length === 0) return [];

    return subtitles
        .map((subtitle): PlayerSubtitle | null => {
            // Use getFileUrl helper to convert Sanity asset reference to CDN URL
            const url = getFileUrl(subtitle.file);

            // Skip if URL couldn't be generated
            if (!url) {
                console.warn(`Failed to generate URL for subtitle: ${subtitle.label}`);
                return null;
            }

            return {
                url,
                label: subtitle.label,
                language: subtitle.language,
                kind: 'subtitles',
                default: subtitle.isDefault || false,
                downloadEnabled: subtitle.downloadEnabled || false,
            };
        })
        .filter((subtitle): subtitle is PlayerSubtitle => subtitle !== null);
}

/**
 * Helper to ensure at least one subtitle is marked as default
 * If no default is set, marks the first subtitle as default
 * 
 * @param subtitles - Array of player subtitle objects
 * @returns Array with at least one subtitle marked as default (if any exist)
 */
export function ensureDefaultSubtitle(subtitles: PlayerSubtitle[]): PlayerSubtitle[] {
    if (subtitles.length === 0) return subtitles;

    const hasDefault = subtitles.some(sub => sub.default);

    if (!hasDefault) {
        return subtitles.map((sub, index) => ({
            ...sub,
            default: index === 0,
        }));
    }

    return subtitles;
}

/**
 * Process subtitles for the player, including async conversion of SRT to VTT
 * 
 * @param subtitles - Sanity subtitle objects
 * @returns Promise resolving to ready-to-use player subtitles
 */
export async function processSubtitlesForPlayer(
    subtitles?: SanitySubtitle[]
): Promise<PlayerSubtitle[]> {
    // 1. Convert initial format and resolve URLs
    const basicSubtitles = convertSanitySubtitlesToPlayerFormat(subtitles);

    // 2. Process each subtitle (convert SRT -> VTT if needed)
    const processed = await Promise.all(
        basicSubtitles.map(async (sub) => {
            if (isSrtFile(sub.url)) {
                try {
                    const vttUrl = await convertSrtToVtt(sub.url);
                    return { ...sub, url: vttUrl };
                } catch (e) {
                    console.error(`Failed to convert SRT subtitle: ${sub.label}`, e);
                    return sub;
                }
            }
            return sub;
        })
    );

    // 3. Ensure default is set
    return ensureDefaultSubtitle(processed);
}
