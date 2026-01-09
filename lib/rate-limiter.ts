import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logger, getClientIP } from './security';

/**
 * Production-Ready Rate Limiter using Upstash Redis
 * 
 * Falls back to in-memory store for development when Redis is not configured.
 */

// ============================================================================
// UPSTASH REDIS CLIENT
// ============================================================================

let redis: Redis | null = null;
let useUpstash = false;

// Initialize Upstash Redis if configured
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        useUpstash = true;
        logger.info('Rate limiter initialized with Upstash Redis');
    } catch (error) {
        logger.error('Failed to initialize Upstash Redis', { error: String(error) });
    }
} else if (process.env.NODE_ENV === 'production') {
    logger.warn('Upstash Redis not configured - rate limiting may not work correctly in production');
}

// ============================================================================
// UPSTASH RATE LIMITERS (Production)
// ============================================================================

// Create rate limiters with different configurations
const createUpstashLimiter = (requests: number, window: string) => {
    if (!redis) return null;
    return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, window as `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`),
        analytics: true,
        prefix: 'cinemanest:ratelimit',
    });
};

// Pre-configured Upstash limiters
const upstashLimiters = {
    AUTH: redis ? createUpstashLimiter(5, '15 m') : null,      // 5 requests per 15 minutes
    API: redis ? createUpstashLimiter(100, '1 m') : null,       // 100 requests per minute
    MUTATION: redis ? createUpstashLimiter(30, '1 h') : null,   // 30 requests per hour
    SENSITIVE: redis ? createUpstashLimiter(3, '5 m') : null,   // 3 requests per 5 minutes
    READ: redis ? createUpstashLimiter(300, '5 m') : null,      // 300 requests per 5 minutes
    AI: redis ? createUpstashLimiter(30, '5 m') : null,         // 30 requests per 5 minutes
    SEARCH: redis ? createUpstashLimiter(60, '1 m') : null,     // 60 searches per minute
};

// ============================================================================
// IN-MEMORY FALLBACK (Development)
// ============================================================================

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store for development (with max size to prevent DoS/OOM)
const rateLimitStore = new Map<string, RateLimitEntry>();
const MAX_STORE_SIZE = 10000; // Max entries to prevent memory leaks

// Cleanup old entries every minute (more frequent)
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        let deletedCount = 0;

        // 1. Cleanup expired entries first
        for (const [key, value] of rateLimitStore.entries()) {
            if (now > value.resetTime) {
                rateLimitStore.delete(key);
                deletedCount++;
            }
        }

        // 2. Safety constraint: If still over limit, remove oldest entries (LRU-like)
        // Map iterates in insertion order, so the first keys are the oldest
        if (rateLimitStore.size > MAX_STORE_SIZE) {
            const entriesToRemove = rateLimitStore.size - MAX_STORE_SIZE + 100; // clear space for 100 new entries
            logger.warn(`[SECURITY] Rate limit store full. Evicting ${entriesToRemove} oldest entries.`);

            let removed = 0;
            for (const [key] of rateLimitStore.keys()) {
                if (removed >= entriesToRemove) break;
                rateLimitStore.delete(key);
                removed++;
            }
        }
    }, 60 * 1000); // Check every minute
}

// ============================================================================
// RATE LIMIT CONFIGURATION
// ============================================================================

export interface RateLimitConfig {
    /** Maximum number of requests allowed */
    limit: number;
    /** Time window in seconds */
    windowInSeconds: number;
    /** Optional custom identifier (defaults to IP address) */
    identifier?: string;
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

// ============================================================================
// PREDEFINED RATE LIMIT PRESETS
// ============================================================================

export const RateLimitPresets = {
    /** Strict rate limit for authentication endpoints - 5 requests per 15 minutes */
    AUTH: { limit: 5, windowInSeconds: 15 * 60 },

    /** Moderate rate limit for API endpoints - 100 requests per minute */
    API: { limit: 100, windowInSeconds: 60 },

    /** Strict rate limit for mutation endpoints - 30 requests per hour */
    MUTATION: { limit: 30, windowInSeconds: 60 * 60 },

    /** Very strict for sensitive operations - 3 requests per 5 minutes */
    SENSITIVE: { limit: 3, windowInSeconds: 5 * 60 },

    /** Lenient for read-only operations - 300 requests per 5 minutes */
    READ: { limit: 300, windowInSeconds: 5 * 60 },

    /** For AI endpoints - 30 requests per 5 minutes (approx 1 every 10s is safe) */
    AI: { limit: 30, windowInSeconds: 5 * 60 },

    /** For search endpoints - 60 requests per minute */
    SEARCH: { limit: 60, windowInSeconds: 60 },
} as const;

// ============================================================================
// MAIN RATE LIMIT FUNCTION
// ============================================================================

/**
 * Check if a request should be rate limited
 * Uses Upstash Redis in production, falls back to in-memory in development
 */
export async function rateLimit(
    request: Request,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const { limit, windowInSeconds, identifier } = config;

    // Get identifier (user ID, IP address, or custom)
    const key = identifier || getClientIP(request);
    const prefixedKey = `ratelimit:${key}`;

    // ========================================================================
    // PRODUCTION SECURITY CHECK (FAIL CLOSED)
    // ========================================================================
    if (process.env.NODE_ENV === 'production' && !redis) {
        // CRITICAL: If Redis is missing in production, we cannot rely on in-memory store
        // because it resets on every lambda invocation (Serverless).
        // Enforcing FAIL CLOSED policy to prevent rate limit bypass.

        logger.error('[SECURITY] Rate limiting configuration missing in production. Enacting FAIL CLOSED.');

        // STRICT FAIL CLOSED: Do not allow requests if security infra is missing
        return {
            success: false,
            limit: 0,
            remaining: 0,
            reset: Math.ceil((Date.now() + 60000) / 1000)
        };
    }

    // Use Upstash if available (Production or Dev with config)
    if (useUpstash && redis) {
        return rateLimitWithUpstash(prefixedKey, limit, windowInSeconds);
    }

    // Fallback to in-memory (Development only)
    return rateLimitInMemory(prefixedKey, limit, windowInSeconds);
}

/**
 * Rate limit using Upstash Redis (production)
 */
async function rateLimitWithUpstash(
    key: string,
    limit: number,
    windowInSeconds: number
): Promise<RateLimitResult> {
    if (!redis) {
        // Should not happen due to check above, but for type safety:
        return { success: false, limit, remaining: 0, reset: Date.now() + 1000 };
    }

    try {
        // Create a custom limiter for this specific config
        const limiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(limit, `${windowInSeconds} s`),
            analytics: true,
            prefix: 'cinemanest:ratelimit',
        });

        const result = await limiter.limit(key);

        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: Math.ceil(result.reset / 1000), // Convert to Unix timestamp in seconds
        };
    } catch (error) {
        logger.error('Upstash rate limit error - enacting FAIL CLOSED policy', { error: String(error), key });

        // SECURITY FIX: FAIL CLOSED
        // If Redis fails mid-operation, we deny the request to prevent abuse.
        // Returning success: false ensures the attacker cannot bypass limits by crashing Redis.
        return {
            success: false,
            limit,
            remaining: 0,
            reset: Math.ceil((Date.now() + 60000) / 1000) // Retry in 1 minute
        };
    }
}

/**
 * Rate limit using in-memory store (development fallback)
 */
function rateLimitInMemory(
    key: string,
    limit: number,
    windowInSeconds: number
): RateLimitResult {
    const now = Date.now();
    const windowMs = windowInSeconds * 1000;

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
        // Create new entry or reset expired one
        entry = {
            count: 0,
            resetTime: now + windowMs,
        };
        rateLimitStore.set(key, entry);
    }

    // Increment count
    entry.count++;

    const remaining = Math.max(0, limit - entry.count);
    const success = entry.count <= limit;

    return {
        success,
        limit,
        remaining,
        reset: Math.ceil(entry.resetTime / 1000), // Unix timestamp in seconds
    };
}

// ============================================================================
// PRESET-BASED RATE LIMITING (Convenience functions)
// ============================================================================

type LimiterPreset = keyof typeof upstashLimiters;

/**
 * Rate limit using a preset configuration with Upstash
 */
export async function rateLimitWithPreset(
    request: Request,
    preset: LimiterPreset,
    identifier?: string
): Promise<RateLimitResult> {
    const key = identifier || getClientIP(request);
    const config = RateLimitPresets[preset];

    // Try to use preset Upstash limiter
    if (useUpstash && upstashLimiters[preset]) {
        try {
            const result = await upstashLimiters[preset]!.limit(key);
            return {
                success: result.success,
                limit: result.limit,
                remaining: result.remaining,
                reset: Math.ceil(result.reset / 1000),
            };
        } catch (error) {
            logger.error('Preset rate limit error - falling back to in-memory', { error: String(error), preset, key });
            // Fallthrough to in-memory fallback below
        }
    }

    // Fallback
    return rateLimitInMemory(`${preset}:${key}`, config.limit, config.windowInSeconds);
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

/**
 * Create a rate limit response with appropriate headers
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
    const response = NextResponse.json(
        {
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: result.reset,
        },
        { status: 429 }
    );

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.reset.toString());
    response.headers.set('Retry-After', Math.max(1, result.reset - Math.floor(Date.now() / 1000)).toString());

    return response;
}

/**
 * Add rate limit headers to a successful response
 */
export function addRateLimitHeaders(
    response: NextResponse,
    result: RateLimitResult
): NextResponse {
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.reset.toString());
    return response;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { useUpstash as isUsingUpstash };
