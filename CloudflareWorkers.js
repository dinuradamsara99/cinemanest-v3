// CORS headers helper function
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Range, Content-Type",
    "Access-Control-Expose-Headers": "Content-Range, Accept-Ranges, Content-Length",
};

// Helper to create response with CORS headers
function corsResponse(body, options = {}) {
    const headers = new Headers(options.headers || {});
    Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
    });
    return new Response(body, { ...options, headers });
}

export default {
    async fetch(request, env, ctx) {
        try {
            const url = new URL(request.url);

            /* ================== CORS Preflight ================== */
            if (request.method === "OPTIONS") {
                return new Response(null, {
                    status: 204,
                    headers: corsHeaders,
                });
            }

            if (!["GET", "HEAD"].includes(request.method)) {
                return corsResponse("Method Not Allowed", { status: 405 });
            }

            /* ================== TOKEN + EXPIRY ================== */
            const token = url.searchParams.get("token");
            const exp = Number(url.searchParams.get("exp"));

            if (!token || token !== env.STREAM_TOKEN) {
                return corsResponse("Invalid token", { status: 403 });
            }

            if (!exp || Date.now() > exp * 1000) {
                return corsResponse("Link expired", { status: 403 });
            }

            if (url.pathname === "/" || url.pathname === "/favicon.ico") {
                return corsResponse("OK");
            }

            /* ================== PATH HANDLING ================== */
            const isSubtitle = url.pathname.startsWith("/subtitles/");
            const match = isSubtitle
                ? url.pathname.match(/^\/subtitles\/([^/]+)$/)
                : url.pathname.match(/^\/([^/]+)$/);

            if (!match) {
                return corsResponse("Invalid URL", { status: 400 });
            }

            const fileName = match[1];
            const isSrt = fileName.endsWith(".srt");
            const isVtt = fileName.endsWith(".vtt");
            const fileId = fileName.replace(/\.(srt|vtt)$/i, "");

            if (!env.GDRIVE_API_KEY) {
                return corsResponse("Missing GDRIVE_API_KEY", { status: 500 });
            }

            const driveUrl =
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${env.GDRIVE_API_KEY}`;

            /* ================== SUBTITLES ================== */
            if (isSubtitle) {
                // Check cache first for subtitles
                const cacheKey = new Request(url.toString(), request);
                const cache = caches.default;
                let cachedResponse = await cache.match(cacheKey);

                if (cachedResponse) {
                    return cachedResponse;
                }

                const resp = await fetch(driveUrl);

                if (!resp.ok) {
                    return corsResponse("Subtitle unavailable", { status: 404 });
                }

                let text = await resp.text();

                // SRT → VTT conversion
                if (isSrt) {
                    text =
                        "WEBVTT\n\n" +
                        text
                            .replace(/\r+/g, "")
                            .replace(/^\d+\n/gm, "")
                            .replace(/,/g, ".");
                }

                const subtitleResponse = corsResponse(text, {
                    status: 200,
                    headers: {
                        "Content-Type": "text/vtt; charset=utf-8",
                        "Cache-Control": "public, max-age=86400", // Cache subtitles for 24 hours
                    },
                });

                // Cache the subtitle response
                ctx.waitUntil(cache.put(cacheKey, subtitleResponse.clone()));

                return subtitleResponse;
            }

            /* ================== VIDEO STREAMING ================== */
            const forwardHeaders = new Headers();
            const range = request.headers.get("Range");

            if (range) {
                forwardHeaders.set("Range", range);
            }

            // Create cache key for video chunks
            const videoCacheKey = new Request(
                `${url.origin}${url.pathname}${range ? `?range=${range}` : ""}`,
                { method: "GET" }
            );
            const cache = caches.default;

            // Try to get from cache first (for repeated seeks)
            let cachedVideo = await cache.match(videoCacheKey);
            if (cachedVideo && !range) {
                // Return cached full video if no range request
                const cachedHeaders = new Headers(cachedVideo.headers);
                Object.entries(corsHeaders).forEach(([key, value]) => {
                    cachedHeaders.set(key, value);
                });
                return new Response(cachedVideo.body, {
                    status: cachedVideo.status,
                    headers: cachedHeaders,
                });
            }

            const driveResp = await fetch(driveUrl, {
                method: "GET",
                headers: forwardHeaders,
                cf: {
                    // Enable edge caching for video content
                    cacheEverything: true,
                    cacheTtlByStatus: {
                        "200-299": 3600,  // Cache successful responses for 1 hour
                        "404": 60,         // Cache 404s for 1 minute
                        "500-599": 0,      // Don't cache errors
                    },
                    // Enable Polish for image optimization (doesn't affect video)
                    polish: "off",
                    // Minimize latency
                    minify: { javascript: false, css: false, html: false },
                },
            });

            if (!driveResp.ok) {
                return corsResponse("Video unavailable", { status: driveResp.status });
            }

            const headers = new Headers(driveResp.headers);

            // Add all CORS headers
            Object.entries(corsHeaders).forEach(([key, value]) => {
                headers.set(key, value);
            });

            // Streaming optimization headers
            headers.set("Content-Disposition", "inline");
            headers.set("Accept-Ranges", "bytes");

            // Cache headers - allow browser to cache video chunks
            if (range) {
                // For range requests (seeking), cache for shorter time
                headers.set("Cache-Control", "public, max-age=300"); // 5 minutes
            } else {
                // For initial load, cache longer
                headers.set("Cache-Control", "public, max-age=3600"); // 1 hour
            }

            // Video streaming hints
            headers.set("X-Content-Type-Options", "nosniff");
            headers.set("Transfer-Encoding", "chunked");

            if (!headers.has("Content-Type")) {
                headers.set("Content-Type", "video/mp4");
            }

            headers.delete("Set-Cookie");

            const response = new Response(driveResp.body, {
                status: driveResp.status,
                statusText: driveResp.statusText,
                headers,
            });

            // Cache the video response for future requests (background)
            if (!range && driveResp.status === 200) {
                ctx.waitUntil(cache.put(videoCacheKey, response.clone()));
            }

            return response;

        } catch (err) {
            return corsResponse(
                "Worker error: " + (err?.message || String(err)),
                { status: 500 }
            );
        }
    },
};
