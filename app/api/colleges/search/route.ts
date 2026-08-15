import { NextResponse } from "next/server";
import { INDIAN_STATES } from "@/constants/filters";
import { searchFirestoreDirectory } from "@/lib/college-providers/firestore-directory";
import {
  CollegeProviderError,
  isGooglePlacesConfigured,
  searchGoogleColleges,
} from "@/lib/college-providers/google-places";
import { searchWikipediaColleges } from "@/lib/college-providers/wikipedia";
import { checkRateLimit } from "@/lib/server/rate-limit";
import type { ExternalCollege, ExternalCollegeSearchResponse } from "@/types";

function mergeResults(...groups: ExternalCollege[][]) {
  const unique = new Map<string, ExternalCollege>();
  for (const result of groups.flat()) {
    const key = result.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!unique.has(key)) unique.set(key, result);
  }
  return [...unique.values()].slice(0, 30);
}

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

  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.get("q")?.trim() || "";
  const requestedState = searchParams.get("state")?.trim() || "";
  const state = INDIAN_STATES.find((item) => item.toLowerCase() === requestedState.toLowerCase());

  if (requestedState && !state) {
    return NextResponse.json({ error: "Select a valid Indian state." }, { status: 400 });
  }
  if ((query.length > 0 && query.length < 2) || query.length > 100 || (!query && !state)) {
    return NextResponse.json({ error: "Enter at least two characters or select a state." }, { status: 400 });
  }

  const directoryPromise = searchFirestoreDirectory(query, state);
  let publicResults: ExternalCollege[] = [];
  let providerError: unknown;
  let usedFallback = false;

  try {
    if (isGooglePlacesConfigured()) {
      try {
        publicResults = await searchGoogleColleges(query, state);
      } catch (error) {
        providerError = error;
        publicResults = await searchWikipediaColleges(query, state);
        usedFallback = true;
      }
    } else {
      publicResults = await searchWikipediaColleges(query, state);
    }
  } catch (error) {
    providerError = providerError || error;
  }

  const directoryResults = await directoryPromise;
  const results = mergeResults(directoryResults, publicResults);
  if (results.length === 0 && providerError) {
    const status = providerError instanceof CollegeProviderError ? providerError.status : 502;
    const message = providerError instanceof CollegeProviderError
      ? providerError.message
      : "Live college search could not be completed.";
    return NextResponse.json({ error: message }, { status });
  }

  const sources = new Set(results.map((item) => item.source));
  const body: ExternalCollegeSearchResponse = {
    results,
    providerConfigured: true,
    source: sources.size > 1 ? "mixed" : results[0]?.source || "wikipedia",
    message: directoryResults.length > 0
      ? "AISHE-backed directory matches are combined with public discovery results. Directory identity is not proof of current courses, fees or admission cutoffs."
      : usedFallback
        ? "Enhanced search is unavailable, so attributed public-directory matches are shown."
        : results.length > 0
          ? "Public-directory matches are shown for discovery only. Verify courses and admissions on the institution website."
          : undefined,
  };
  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
