import crypto from 'crypto';
import { NextResponse } from 'next/server';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Security Utilities and Helpers
 * Refactored for production-grade security
 */

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

/**
 * Validate required security environment variables
 * Call this at runtime when actually needed
 */
export function validateSecurityEnv(): void {
    const required = ['NEXTAUTH_SECRET'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0 && process.env.NODE_ENV === 'production') {
        console.error(`SECURITY WARNING: Missing environment variables: ${missing.join(', ')}`);
    }
}

// Lazy-loaded CSRF secret getter (validates at runtime, not build time)
let _csrfSecret: string | null = null;

const getCSRFSecret = (): string => {
    // Return cached value if available
    if (_csrfSecret) return _csrfSecret;

    const secret = process.env.CSRF_SECRET;

    if (secret) {
        _csrfSecret = secret;
        return secret;
    }

    // In development, use a default (with warning)
    if (process.env.NODE_ENV === 'development') {
        console.warn('[SECURITY] CSRF_SECRET not set - using default for development only');
        _csrfSecret = 'dev-only-csrf-secret-not-for-production';
        return _csrfSecret;
    }

    // In production, throw at runtime when CSRF is actually used
    throw new Error('CRITICAL: CSRF_SECRET environment variable is required in production');
};

// ============================================================================
// STRUCTURED LOGGER
// ============================================================================

export const logger = {
    error: (message: string, meta?: Record<string, unknown>) => {
        if (process.env.NODE_ENV !== 'test') {
            console.error(JSON.stringify({
                level: 'error',
                timestamp: new Date().toISOString(),
                message,
                ...meta
            }));
        }
    },
    warn: (message: string, meta?: Record<string, unknown>) => {
        if (process.env.NODE_ENV !== 'test') {
            console.warn(JSON.stringify({
                level: 'warn',
                timestamp: new Date().toISOString(),
                message,
                ...meta
            }));
        }
    },
    info: (message: string, meta?: Record<string, unknown>) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(JSON.stringify({
                level: 'info',
                timestamp: new Date().toISOString(),
                message,
                ...meta
            }));
        }
    },
    debug: (message: string, meta?: Record<string, unknown>) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(JSON.stringify({
                level: 'debug',
                timestamp: new Date().toISOString(),
                message,
                ...meta
            }));
        }
    }
};

// ============================================================================
// INPUT SANITIZATION (Enhanced with DOMPurify)
// ============================================================================

/**
 * Sanitize string input to prevent XSS attacks
 * Uses DOMPurify for robust protection
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';

    // First, limit length to prevent DoS
    const trimmed = input.trim().substring(0, 10000);

    // Use DOMPurify to strip all HTML
    const sanitized = DOMPurify.sanitize(trimmed, {
        ALLOWED_TAGS: [], // No HTML allowed
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
    });

    // Additional protection against non-HTML vectors
    return sanitized
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/on\w+\s*=/gi, '');
}

/**
 * Sanitize HTML content (for rich text fields)
 * Allows safe formatting tags only
 */
export function sanitizeHTML(input: string): string {
    if (!input) return '';

    return DOMPurify.sanitize(input.substring(0, 50000), {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
        ALLOW_DATA_ATTR: false,
        ADD_ATTR: ['rel'],
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    });
}

/**
 * Sanitize content for JSON-LD structured data
 * Prevents script injection in structured data
 */
export function sanitizeForJsonLd(input: string): string {
    if (!input) return '';

    return input
        .replace(/\\/g, '\\\\') // Escape backslashes first
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/'/g, '\\u0027')
        .replace(/"/g, '\\"')
        .replace(/\//g, '\\/') // Escape forward slashes to prevent </script>
        .substring(0, 5000);
}

/**
 * Validate and sanitize URL
 */
export function sanitizeURL(url: string): string | null {
    if (!url) return null;

    try {
        const parsed = new URL(url);

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return null;
        }

        // Remove any credentials from URL
        parsed.username = '';
        parsed.password = '';

        return parsed.toString();
    } catch {
        return null;
    }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
}

// ============================================================================
// CSRF PROTECTION (Fixed Implementation)
// ============================================================================

/**
 * Generate a CSRF token tied to a session
 * @param sessionId - Required session identifier
 */
export function generateCSRFToken(sessionId: string): string {
    if (!sessionId) {
        throw new Error('sessionId is required for CSRF token generation');
    }

    const timestamp = Date.now().toString();
    const secret = getCSRFSecret();

    // Create HMAC signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${sessionId}:${timestamp}`);
    const signature = hmac.digest('hex');

    // Combine timestamp and signature
    return `${timestamp}.${signature}`;
}

/**
 * Verify CSRF token (FIXED: Uses session ID and timing-safe comparison)
 * @param token - The CSRF token to verify
 * @param sessionId - The session ID that was used to generate the token
 * @param maxAge - Maximum age of token in milliseconds (default: 1 hour)
 */
export function verifyCSRFToken(token: string, sessionId: string, maxAge = 3600000): boolean {
    // Both token and sessionId are required
    if (!token || !sessionId) {
        logger.warn('CSRF verification failed: missing token or sessionId');
        return false;
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
        logger.warn('CSRF verification failed: invalid token format');
        return false;
    }

    const [timestamp, signature] = parts;

    // Check if token is expired
    const tokenTime = parseInt(timestamp, 10);
    if (isNaN(tokenTime) || Date.now() - tokenTime > maxAge) {
        logger.warn('CSRF verification failed: token expired');
        return false;
    }

    // Regenerate expected signature using the SAME sessionId
    const secret = getCSRFSecret();
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${sessionId}:${timestamp}`);
    const expectedSignature = hmac.digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    try {
        const signatureBuffer = Buffer.from(signature, 'hex');
        const expectedBuffer = Buffer.from(expectedSignature, 'hex');

        if (signatureBuffer.length !== expectedBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch {
        logger.warn('CSRF verification failed: comparison error');
        return false;
    }
}

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

/**
 * Validate request body size
 */
export function validateBodySize(body: unknown, maxSizeKB = 100): boolean {
    const bodyString = JSON.stringify(body);
    const sizeKB = Buffer.byteLength(bodyString, 'utf8') / 1024;
    return sizeKB <= maxSizeKB;
}

/**
 * Validate string length
 */
export function validateLength(str: string, min: number, max: number): boolean {
    const length = str.trim().length;
    return length >= min && length <= max;
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

export const securityHeaders = {
    // Prevent clickjacking - SAMEORIGIN allows embedding only from same origin
    'X-Frame-Options': 'SAMEORIGIN',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // NOTE: X-XSS-Protection removed - deprecated and CSP is primary defense

    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    return response;
}

// ============================================================================
// ERROR RESPONSE HELPERS
// ============================================================================

/**
 * Create a safe error response (no internal details in production)
 */
export function createSafeErrorResponse(
    message: string,
    statusCode: number = 500,
    details?: string
): NextResponse {
    const isProduction = process.env.NODE_ENV === 'production';

    // Log the full error internally
    if (details) {
        logger.error(message, { details, statusCode });
    }

    return NextResponse.json(
        {
            error: message,
            // Only include details in development
            ...((!isProduction && details) && { details }),
        },
        { status: statusCode }
    );
}

// ============================================================================
// SECURITY LOGGING
// ============================================================================

export enum SecurityEventType {
    AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID',
    INVALID_INPUT = 'INVALID_INPUT',
    UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
    SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

/**
 * Log security event
 */
export function logSecurityEvent(
    eventType: SecurityEventType,
    details: Record<string, unknown>
): void {
    logger.warn(`[SECURITY] ${eventType}`, {
        type: eventType,
        ...details,
    });

    // TODO: In production, integrate with monitoring service
    // - Send to Sentry
    // - Send to CloudWatch
    // - Send to custom SIEM
}

// ============================================================================
// CLIENT IP EXTRACTION
// ============================================================================

/**
 * Get client IP from request headers (handles proxies)
 */
export function getClientIP(request: Request): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    return 'unknown';
}

// ============================================================================
// CSRF VERIFICATION HELPER (For API Routes)
// ============================================================================

/**
 * Verify CSRF token from request headers
 * Use this in API routes that handle state-changing operations
 * 
 * @param request - The incoming request
 * @param sessionId - The user's session ID
 * @returns Object with success status and optional error response
 */
export function verifyCSRFFromRequest(
    request: Request,
    sessionId: string
): { valid: boolean; errorResponse?: Response } {
    const csrfToken = request.headers.get('x-csrf-token');

    if (!csrfToken) {
        logSecurityEvent(SecurityEventType.CSRF_TOKEN_INVALID, {
            reason: 'Missing token',
            ip: getClientIP(request),
        });

        return {
            valid: false,
            errorResponse: new Response(
                JSON.stringify({ error: 'CSRF token required' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            ),
        };
    }

    if (!verifyCSRFToken(csrfToken, sessionId)) {
        logSecurityEvent(SecurityEventType.CSRF_TOKEN_INVALID, {
            reason: 'Invalid or expired token',
            ip: getClientIP(request),
        });

        return {
            valid: false,
            errorResponse: new Response(
                JSON.stringify({ error: 'Invalid or expired CSRF token' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            ),
        };
    }

    return { valid: true };
}

// ============================================================================
// INPUT VALIDATION HELPERS
// ============================================================================

/**
 * Validate and clamp a numeric parameter to safe bounds
 * Prevents DoS attacks via extremely large limits
 */
export function clampNumber(value: number, min: number, max: number): number {
    if (isNaN(value)) return min;
    return Math.min(Math.max(value, min), max);
}

/**
 * Validate origin header against allowed domains
 */
export function validateOrigin(request: Request): boolean {
    const origin = request.headers.get('origin');

    // Same-origin requests don't have origin header
    if (!origin) return true;

    const allowedOrigins = [
        process.env.NEXTAUTH_URL,
        process.env.NEXT_PUBLIC_SITE_URL,
        'http://localhost:3000',
        'http://localhost:3001',
    ].filter(Boolean) as string[];

    return allowedOrigins.some(allowed => {
        try {
            const allowedUrl = new URL(allowed);
            const originUrl = new URL(origin);
            return originUrl.origin === allowedUrl.origin;
        } catch {
            return false;
        }
    });
}
