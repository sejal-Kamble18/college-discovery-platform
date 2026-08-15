import { INDIAN_STATES } from "@/constants/filters";
import { CollegeProviderError } from "@/lib/college-providers/google-places";
import type { ExternalCollege } from "@/types";

const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";
const INSTITUTION_WORDS = /\b(college|university|institute|institution|school|academy|polytechnic)\b/i;
const SEARCH_STOP_WORDS = new Set(["college", "university", "institute", "institution", "of", "the", "in", "and", "india"]);
const INDIA_TERMS = ["India", "Indian", ...INDIAN_STATES, "Chandigarh", "Puducherry", "Jammu", "Kashmir", "Ladakh"];
const INDIA_SIGNAL = new RegExp(`\\b(${INDIA_TERMS.map(escapeRegExp).join("|")})\\b`, "i");

interface WikipediaPage {
  pageid?: number;
  title?: string;
  index?: number;
  extract?: string;
  fullurl?: string;
}

interface WikipediaResponse {
  query?: { pages?: WikipediaPage[] | Record<string, WikipediaPage> };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function responsePages(data: WikipediaResponse) {
  const pages = data.query?.pages;
  return Array.isArray(pages) ? pages : Object.values(pages || {});
}

function queryTokens(query: string) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !SEARCH_STOP_WORDS.has(token));
}

function normalizePage(page: WikipediaPage, requestedState?: string, fromStateDirectory = false): ExternalCollege | null {
  const name = page.title?.trim();
  const id = page.pageid;
  const description = page.extract?.trim() || "";
  const searchable = `${name || ""} ${description}`;
  if (!name || !id || name.startsWith("List of ") || !INSTITUTION_WORDS.test(searchable)) return null;
  if (!fromStateDirectory && !INDIA_SIGNAL.test(searchable)) return null;

  return {
    source: "wikipedia",
    externalId: `wiki-${id}`,
    name,
    formattedAddress: requestedState ? `${requestedState}, India` : "India",
    state: requestedState,
    country: "India",
    website: page.fullurl,
    description,
  };
}

async function fetchWikipedia(params: Record<string, string>): Promise<WikipediaPage[]> {
  const url = new URL(WIKIPEDIA_API);
  const shared = {
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "info|extracts",
    inprop: "url",
    exintro: "1",
    explaintext: "1",
    exsentences: "2",
  };
  for (const [key, value] of Object.entries({ ...shared, ...params })) url.searchParams.set(key, value);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "Api-User-Agent": "EduDiscover/0.2 (https://github.com/sejal-Kamble18/college-discovery-platform)",
      },
      cache: "force-cache",
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new CollegeProviderError("The public college directory is temporarily unavailable.", 502);
  }

  if (!response.ok) {
    throw new CollegeProviderError("The public college directory is temporarily unavailable.", response.status);
  }

  return responsePages((await response.json()) as WikipediaResponse);
}

async function searchByText(query: string, state?: string) {
  if (!query.trim()) return [];
  const location = state ? ` "${state}"` : " India";
  return fetchWikipedia({
    generator: "search",
    gsrsearch: `${query.trim()}${location}`,
    gsrnamespace: "0",
    gsrlimit: "25",
  });
}

async function browseStateDirectory(state?: string) {
  if (!state) return [];
  return fetchWikipedia({
    generator: "categorymembers",
    gcmtitle: `Category:Universities and colleges in ${state}`,
    gcmnamespace: "0",
    gcmtype: "page",
    gcmlimit: "50",
  });
}

export async function searchWikipediaColleges(query: string, state?: string): Promise<ExternalCollege[]> {
  const [searchPages, statePages] = await Promise.all([
    searchByText(query, state),
    browseStateDirectory(state),
  ]);
  const tokens = queryTokens(query);
  const normalized = [
    ...searchPages.map((page) => normalizePage(page, state, false)),
    ...statePages.map((page) => normalizePage(page, state, true)),
  ].filter((item): item is ExternalCollege => item !== null);

  const filtered = state && tokens.length > 0
    ? normalized.filter((item) => {
        const text = `${item.name} ${item.description || ""}`.toLowerCase();
        return tokens.every((token) => text.includes(token));
      })
    : normalized;

  const unique = new Map<string, ExternalCollege>();
  for (const college of filtered) {
    if (!unique.has(college.name.toLowerCase())) unique.set(college.name.toLowerCase(), college);
  }

  return [...unique.values()].slice(0, 30);
}
