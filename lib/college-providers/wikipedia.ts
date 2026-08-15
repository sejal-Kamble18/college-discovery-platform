import type { ExternalCollege } from "@/types";
import { CollegeProviderError } from "@/lib/college-providers/google-places";

const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";
const INSTITUTION_WORDS = /\b(college|university|institute|school|academy)\b/i;

interface WikipediaPage {
  pageid?: number;
  title?: string;
  index?: number;
  extract?: string;
  fullurl?: string;
}

interface WikipediaResponse {
  query?: { pages?: Record<string, WikipediaPage> };
}

function normalizePage(page: WikipediaPage): ExternalCollege | null {
  const name = page.title?.trim();
  const id = page.pageid;
  if (!name || !id || !INSTITUTION_WORDS.test(`${name} ${page.extract || ""}`)) return null;

  return {
    source: "wikipedia",
    externalId: `wiki-${id}`,
    name,
    formattedAddress: "India · Wikipedia source profile",
    country: "India",
    website: page.fullurl,
    description: page.extract?.trim(),
  };
}

export async function searchWikipediaColleges(query: string): Promise<ExternalCollege[]> {
  const url = new URL(WIKIPEDIA_API);
  const params = {
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrsearch: `${query} college OR university OR institute India`,
    gsrnamespace: "0",
    gsrlimit: "15",
    prop: "info|extracts",
    inprop: "url",
    exintro: "1",
    explaintext: "1",
    exsentences: "2",
  };
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "Api-User-Agent": "EduDiscover/0.1 (https://github.com/sejal-Kamble18/college-discovery-platform)",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new CollegeProviderError("Wikipedia live search is temporarily unavailable.", 502);
  }

  if (!response.ok) {
    throw new CollegeProviderError("Wikipedia live search is temporarily unavailable.", response.status);
  }

  const data = (await response.json()) as WikipediaResponse;
  return Object.values(data.query?.pages || {})
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .map(normalizePage)
    .filter((item): item is ExternalCollege => item !== null)
    .slice(0, 12);
}
