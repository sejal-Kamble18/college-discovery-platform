import { NextResponse } from "next/server";
import {
  CollegeProviderError,
  isGooglePlacesConfigured,
  searchGoogleColleges,
} from "@/lib/college-providers/google-places";
import { searchWikipediaColleges } from "@/lib/college-providers/wikipedia";
import { checkRateLimit } from "@/lib/server/rate-limit";
import type { ExternalCollegeSearchResponse } from "@/types";

export async function GET(request: Request) {
  const clientAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "local";
  const rate = checkRateLimit(`college-search:${clientAddress}`);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many live searches. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  }

  const query = new URL(request.url).searchParams.get("q")?.trim() || "";

  if (query.length < 3 || query.length > 100) {
    return NextResponse.json(
      { error: "Search must contain between 3 and 100 characters." },
      { status: 400 },
    );
  }

  try {
    if (!isGooglePlacesConfigured()) {
      const results = await searchWikipediaColleges(query);
      const body: ExternalCollegeSearchResponse = {
        results,
        providerConfigured: true,
        source: "wikipedia",
        message: results.length > 0
          ? "Showing attributed Wikipedia summaries. Add Google Places for richer directory details."
          : undefined,
      };
      return NextResponse.json(body, {
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    const results = await searchGoogleColleges(query);
    const body: ExternalCollegeSearchResponse = {
      results,
      providerConfigured: true,
      source: "google-places",
    };
    return NextResponse.json(body, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (isGooglePlacesConfigured()) {
      try {
        const results = await searchWikipediaColleges(query);
        const body: ExternalCollegeSearchResponse = {
          results,
          providerConfigured: true,
          source: "wikipedia",
          message: "Enhanced directory search is unavailable, so these are attributed Wikipedia summaries.",
        };
        return NextResponse.json(body, {
          headers: { "Cache-Control": "private, no-store" },
        });
      } catch {
        // Return the original enhanced-provider error when both providers fail.
      }
    }

    const status = error instanceof CollegeProviderError ? error.status : 502;
    const message =
      error instanceof CollegeProviderError
        ? error.message
        : "Live college search could not be completed.";
    return NextResponse.json({ error: message }, { status });
  }
}
