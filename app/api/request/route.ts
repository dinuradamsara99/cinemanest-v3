import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
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

    // Check if write token is configured
    if (!process.env.SANITY_API_WRITE_TOKEN) {
      console.error(
        "SANITY_API_WRITE_TOKEN is not configured. Please add SANITY_API_WRITE_TOKEN to your .env.local file with a valid Sanity write token."
      );
      return NextResponse.json(
        {
          error: "Server configuration error",
          details:
            "Missing SANITY_API_WRITE_TOKEN environment variable. Please contact the site administrator.",
        },
        { status: 500 }
      );
    }

    // Create the request document in Sanity
    const document = {
      _type: "request",
      title: title.trim(),
      mediaType,
      notes: notes?.trim() || "",
      status: "new",
      submittedAt: new Date().toISOString(),
    };

    const result = await writeClient.create(document);

    return NextResponse.json(
      {
        success: true,
        message: "Request submitted successfully",
        id: result._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting request:", error);

    // Handle Sanity-specific errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to submit request",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to submit request",
        details: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
