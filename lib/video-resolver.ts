/**
 * Video Link Resolver Utility
 * Extracts real video URLs (.m3u8/.mp4) from embed pages like Vidfast, Filemoon, etc.
 */

// ============================================================================
// PACKER DECODER - Decode eval(function(p,a,c,k,e,d)...) obfuscated code
// ============================================================================
export function decodePacker(packedCode: string): string {
    // Extract the packed function parameters
    const packerMatch = packedCode.match(
        /eval\(function\(p,a,c,k,e,d\)\{.*?\}(?:\(|.return p\})\s*\('([^']+)',\s*(\d+),\s*(\d+),\s*'([^']+)'\.split\('\|'\)/
    );

    if (!packerMatch) {
        // Try alternate pattern
        const altMatch = packedCode.match(
            /}\('([^']+)',(\d+),(\d+),'([^']+)'\.split/
        );
        if (!altMatch) {
            return packedCode;
        }
        return unpack(altMatch[1], parseInt(altMatch[2]), parseInt(altMatch[3]), altMatch[4].split('|'));
    }

    return unpack(packerMatch[1], parseInt(packerMatch[2]), parseInt(packerMatch[3]), packerMatch[4].split('|'));
}

function unpack(p: string, a: number, c: number, k: string[]): string {
    // Create a function to convert number to base
    const e = (c: number): string => {
        return (c < a ? '' : e(Math.floor(c / a))) +
            ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
    };

    // Replace placeholders with actual values
    while (c--) {
        if (k[c]) {
            const regex = new RegExp('\\b' + e(c) + '\\b', 'g');
            p = p.replace(regex, k[c]);
        }
    }

    return p;
}

// ============================================================================
// URL EXTRACTORS - Extract video URLs from decoded content
// ============================================================================
export function extractM3U8(content: string): string | null {
    // Pattern for .m3u8 URLs
    const patterns = [
        /["']?(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/gi,
        /source:\s*["']([^"']+\.m3u8[^"']*)/gi,
        /file:\s*["']([^"']+\.m3u8[^"']*)/gi,
        /src:\s*["']([^"']+\.m3u8[^"']*)/gi,
        /hls:\s*["']([^"']+\.m3u8[^"']*)/gi,
    ];

    for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
            // Clean up the URL
            let url = match[0].replace(/["']/g, '').replace(/^(source|file|src|hls):\s*/, '');
            if (url.startsWith('http')) {
                return url;
            }
        }
    }

    // Direct pattern match
    const directMatch = content.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i);
    if (directMatch) {
        return directMatch[0];
    }

    return null;
}

export function extractMP4(content: string): string | null {
    // Pattern for .mp4 URLs
    const patterns = [
        /["']?(https?:\/\/[^"'\s]+\.mp4[^"'\s]*)/gi,
        /source:\s*["']([^"']+\.mp4[^"']*)/gi,
        /file:\s*["']([^"']+\.mp4[^"']*)/gi,
        /src:\s*["']([^"']+\.mp4[^"']*)/gi,
    ];

    for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
            let url = match[0].replace(/["']/g, '').replace(/^(source|file|src):\s*/, '');
            if (url.startsWith('http')) {
                return url;
            }
        }
    }

    const directMatch = content.match(/https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*/i);
    if (directMatch) {
        return directMatch[0];
    }

    return null;
}

// ============================================================================
// PROVIDER-SPECIFIC EXTRACTORS
// ============================================================================

export interface ResolvedVideo {
    url: string;
    type: 'hls' | 'mp4' | 'unknown';
    provider: string;
    quality?: string;
}

// Generic extractor that works for most providers
export async function extractVideoUrl(html: string, provider: string): Promise<ResolvedVideo | null> {
    let decodedContent = html;

    // Check for packed/obfuscated code
    if (html.includes('eval(function(p,a,c,k,e,d)')) {
        const packedMatches = html.match(/eval\(function\(p,a,c,k,e,d\)\{[^}]+\}\([^)]+\)\)/g);
        if (packedMatches) {
            for (const packed of packedMatches) {
                try {
                    const decoded = decodePacker(packed);
                    decodedContent += '\n' + decoded;
                } catch (e) {
                    console.error('Failed to decode packed code:', e);
                }
            }
        }
    }

    // Also check for JWPlayer setup
    const jwMatch = decodedContent.match(/sources:\s*\[([^\]]+)\]/);
    if (jwMatch) {
        decodedContent += '\n' + jwMatch[1];
    }

    // Try to extract m3u8 first (higher quality streaming)
    const m3u8Url = extractM3U8(decodedContent);
    if (m3u8Url) {
        return {
            url: m3u8Url,
            type: 'hls',
            provider,
        };
    }

    // Fallback to mp4
    const mp4Url = extractMP4(decodedContent);
    if (mp4Url) {
        return {
            url: mp4Url,
            type: 'mp4',
            provider,
        };
    }

    return null;
}

// Vidfast specific extractor
export async function extractVidfast(html: string): Promise<ResolvedVideo | null> {
    // Vidfast often uses packed code or JWPlayer
    return extractVideoUrl(html, 'vidfast');
}

// Filemoon specific extractor
export async function extractFilemoon(html: string): Promise<ResolvedVideo | null> {
    // Filemoon uses similar obfuscation
    return extractVideoUrl(html, 'filemoon');
}

// ============================================================================
// MAIN RESOLVER FUNCTION
// ============================================================================
export async function resolveVideoUrl(embedUrl: string): Promise<ResolvedVideo | null> {
    try {
        // Determine provider
        const url = new URL(embedUrl);
        const hostname = url.hostname.toLowerCase();

        let provider = 'unknown';
        if (hostname.includes('vidfast')) provider = 'vidfast';
        else if (hostname.includes('filemoon')) provider = 'filemoon';
        else if (hostname.includes('streamwish')) provider = 'streamwish';
        else if (hostname.includes('doodstream')) provider = 'doodstream';

        // Fetch the embed page
        const response = await fetch(embedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': embedUrl,
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch embed page: ${response.status}`);
            return null;
        }

        const html = await response.text();

        // Use provider-specific extractor or generic one
        switch (provider) {
            case 'vidfast':
                return await extractVidfast(html);
            case 'filemoon':
                return await extractFilemoon(html);
            default:
                return await extractVideoUrl(html, provider);
        }
    } catch (error) {
        console.error('Error resolving video URL:', error);
        return null;
    }
}
