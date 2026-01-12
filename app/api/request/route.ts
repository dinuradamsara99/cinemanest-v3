import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeClient } from "@/sanity/lib/client";
import { rateLimit, createRateLimitResponse, addRateLimitHeaders, RateLimitPresets } from "@/lib/rate-limiter";
import { sanitizeInput, validateLength, createSafeErrorResponse, logSecurityEvent, SecurityEventType, verifyCSRFFromRequest, logger } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. AUTHENTICATION CHECK (CRITICAL SECURITY FIX)
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      logSecurityEvent(SecurityEventType.UNAUTHORIZED_ACCESS, {
        endpoint: '/api/request',
        method: 'POST',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      });

      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. RATE LIMITING (5 requests per day)
    const rateLimitResult = await rateLimit(request, {
      ...RateLimitPresets.REQUEST,  // 5 requests per 24 hours
      identifier: session.user.id, // User-based rate limiting
    });

    if (!rateLimitResult.success) {
      logSecurityEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, {
        userId: session.user.id,
        endpoint: '/api/request',
        limit: rateLimitResult.limit,
      });

      return createRateLimitResponse(rateLimitResult);
    }

    // 3. CSRF VERIFICATION (Prevent cross-site request forgery)
    const csrfCheck = verifyCSRFFromRequest(request, session.user.id);
    if (!csrfCheck.valid) {
      return csrfCheck.errorResponse;
    }

    // 4. PARSE AND VALIDATE REQUEST BODY
    const body = await request.json();
    const { title, mediaType, notes } = body;

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!mediaType || !["movie", "tvshow"].includes(mediaType)) {
      return NextResponse.json(
        { error: "Valid media type is required (movie or tvshow)" },
        { status: 400 }
      );
    }

    // 4. INPUT SANITIZATION (Prevent XSS and injection attacks)
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedNotes = notes ? sanitizeInput(notes) : "";

    // Validate input lengths
    if (!validateLength(sanitizedTitle, 1, 200)) {
      logSecurityEvent(SecurityEventType.INVALID_INPUT, {
        userId: session.user.id,
        field: 'title',
        length: sanitizedTitle.length,
      });

      return NextResponse.json(
        { error: "Title must be between 1 and 200 characters" },
        { status: 400 }
      );
    }

    if (sanitizedNotes && !validateLength(sanitizedNotes, 0, 1000)) {
      return NextResponse.json(
        { error: "Notes must not exceed 1000 characters" },
        { status: 400 }
      );
    }

    // 5. CHECK SANITY CONFIGURATION
    if (!process.env.SANITY_API_WRITE_TOKEN) {
      logger.error('SANITY_API_WRITE_TOKEN is not configured', {
        endpoint: '/api/request'
      });
      return createSafeErrorResponse(
        "Service temporarily unavailable",
        503,
        "Missing SANITY_API_WRITE_TOKEN environment variable"
      );
    }

    // 6. CREATE THE REQUEST DOCUMENT IN SANITY
    const document = {
      _type: "request",
      title: sanitizedTitle,
      mediaType,
      notes: sanitizedNotes,
      status: "new",
      submittedAt: new Date().toISOString(),
      userId: session.user.id,
      userEmail: session.user.email,
    };

    const result = await writeClient.create(document);

    // 7. RETURN SUCCESS RESPONSE WITH RATE LIMIT HEADERS
    const response = NextResponse.json(
      {
        success: true,
        message: "Request submitted successfully",
        id: result._id,
      },
      { status: 201 }
    );

    return addRateLimitHeaders(response, rateLimitResult);

  } catch (error) {
    logger.error('Error submitting request', { error: String(error) });

    // Handle Sanity-specific errors without exposing internal details
    if (error instanceof Error) {
      return createSafeErrorResponse(
        "Failed to submit request",
        500,
        error.message
      );
    }

    return createSafeErrorResponse(
      "An unexpected error occurred",
      500
    );
  }
}
