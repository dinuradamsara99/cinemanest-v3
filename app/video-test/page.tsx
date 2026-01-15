"use client";

import { useState, useRef } from "react";

export default function VideoTestPage() {
    const [videoUrl, setVideoUrl] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [videoInfo, setVideoInfo] = useState<string>("");
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleTest = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;

        video.onerror = () => {
            const mediaError = video.error;
            if (mediaError) {
                const errorCodes: Record<number, string> = {
                    1: "MEDIA_ERR_ABORTED - Fetching aborted by user",
                    2: "MEDIA_ERR_NETWORK - Network error",
                    3: "MEDIA_ERR_DECODE - Error decoding media (codec issue)",
                    4: "MEDIA_ERR_SRC_NOT_SUPPORTED - Source not supported"
                };
                setError(`Video Error Code ${mediaError.code}: ${errorCodes[mediaError.code] || "Unknown"}\nMessage: ${mediaError.message || "No message"}`);
            } else {
                setError("Video Error: Unknown error occurred");
            }
        };

        video.onloadedmetadata = () => {
            setVideoInfo(`
                Duration: ${video.duration}s
                Width: ${video.videoWidth}px
                Height: ${video.videoHeight}px
                Ready State: ${video.readyState}
            `);
        };

        video.oncanplay = () => {
            setVideoInfo(prev => prev + `\nCan Play: Yes`);
        };

        video.load();
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-2xl font-bold mb-4">Video Debug Test Page</h1>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Enter video URL..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full p-3 bg-zinc-800 rounded border border-zinc-700 text-white"
                />
                <button
                    onClick={handleTest}
                    className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                >
                    Load & Test Video
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded">
                    <p className="text-red-300">{error}</p>
                </div>
            )}

            {videoInfo && (
                <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded">
                    <pre className="text-green-300 whitespace-pre-wrap">{videoInfo}</pre>
                </div>
            )}

            <div className="aspect-video bg-zinc-900 rounded overflow-hidden border-2 border-zinc-700">
                {/* Simple native video - no React complexity */}
                <video
                    ref={videoRef}
                    src={videoUrl || undefined}
                    controls
                    playsInline
                    className="w-full h-full"
                    style={{ backgroundColor: 'black' }}
                >
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="mt-4 text-zinc-400 text-sm">
                <p>Test Instructions:</p>
                <ol className="list-decimal ml-5 mt-2 space-y-1">
                    <li>Paste your video URL above</li>
                    <li>Click "Load & Test Video"</li>
                    <li>If video shows black but audio plays, the issue is video codec</li>
                    <li>If video doesn&apos;t play at all, the issue is the URL/server</li>
                    <li>If video plays correctly here, the issue is in CustomVideoPlayer</li>
                </ol>
            </div>
        </div>
    );
}
