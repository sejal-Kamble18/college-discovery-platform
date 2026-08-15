import type { ExternalCollege } from "@/types";

const SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const DETAILS_URL = "https://places.googleapis.com/v1/places";
const SEARCH_FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.addressComponents",
  "places.location",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "places.businessStatus",
  "places.types",
].join(",");
const DETAIL_FIELDS = SEARCH_FIELDS.replaceAll("places.", "");

interface GoogleText {
  text?: string;
}

interface GoogleAddressComponent {
  longText?: string;
  types?: string[];
}

interface GooglePlace {
  id?: string;
  displayName?: GoogleText;
  formattedAddress?: string;
  addressComponents?: GoogleAddressComponent[];
  location?: { latitude?: number; longitude?: number };
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  businessStatus?: string;
  types?: string[];
}

interface GoogleSearchResponse {
  places?: GooglePlace[];
}

export class CollegeProviderError extends Error {
  constructor(
    message: string,
    public readonly status = 502,
  ) {
    super(message);
    this.name = "CollegeProviderError";
  }
}

export function isGooglePlacesConfigured(): boolean {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY?.trim());
}

function addressPart(place: GooglePlace, type: string): string | undefined {
  return place.addressComponents?.find((part) => part.types?.includes(type))?.longText;
}

function normalizePlace(place: GooglePlace): ExternalCollege | null {
  const id = place.id?.trim();
  const name = place.displayName?.text?.trim();
  if (!id || !name) return null;

  return {
    source: "google-places",
    externalId: id,
    name,
    formattedAddress: place.formattedAddress?.trim() || "Address unavailable",
    city:
      addressPart(place, "locality") ||
      addressPart(place, "administrative_area_level_3") ||
      addressPart(place, "administrative_area_level_2"),
    state: addressPart(place, "administrative_area_level_1"),
    country: addressPart(place, "country"),
    latitude: place.location?.latitude,
    longitude: place.location?.longitude,
    website: place.websiteUri,
    phone: place.internationalPhoneNumber || place.nationalPhoneNumber,
    rating: place.rating,
    ratingCount: place.userRatingCount,
    googleMapsUrl: place.googleMapsUri,
    businessStatus: place.businessStatus,
  };
}

async function parseProviderResponse<T>(response: Response): Promise<T> {
  if (response.ok) return (await response.json()) as T;

  let providerMessage = "The live college provider is temporarily unavailable.";
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    if (response.status === 429) {
      providerMessage = "Live search is busy. Please wait a moment and try again.";
    } else if (response.status === 403) {
      providerMessage = "Live college search is not enabled for this deployment.";
    } else if (body.error?.message && process.env.NODE_ENV !== "production") {
      providerMessage = body.error.message;
    }
  } catch {
    // Keep the safe public error above when Google returns a non-JSON body.
  }

  throw new CollegeProviderError(providerMessage, response.status);
}

function providerHeaders(fieldMask: string): HeadersInit {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    throw new CollegeProviderError("Live college search is not configured.", 503);
  }

  return {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": fieldMask,
  };
}

export async function searchGoogleColleges(query: string, state?: string): Promise<ExternalCollege[]> {
  const location = state?.trim() ? ` in ${state.trim()}` : " in India";
  const response = await fetch(SEARCH_URL, {
    method: "POST",
    headers: providerHeaders(SEARCH_FIELDS),
    body: JSON.stringify({
      textQuery: `${query || "colleges and universities"}${location}`,
      languageCode: "en",
      regionCode: "IN",
      pageSize: 10,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });

  const data = await parseProviderResponse<GoogleSearchResponse>(response);
  return (data.places || [])
    .map(normalizePlace)
    .filter((place): place is ExternalCollege => place !== null);
}

export async function getGoogleCollege(placeId: string): Promise<ExternalCollege | null> {
  const response = await fetch(`${DETAILS_URL}/${encodeURIComponent(placeId)}?languageCode=en&regionCode=IN`, {
    headers: providerHeaders(`${DETAIL_FIELDS},nationalPhoneNumber,internationalPhoneNumber`),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });

  if (response.status === 404) return null;
  const data = await parseProviderResponse<GooglePlace>(response);
  return normalizePlace(data);
}
