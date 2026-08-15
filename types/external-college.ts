export interface ExternalCollege {
  source: "google-places" | "wikipedia";
  externalId: string;
  name: string;
  formattedAddress: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  phone?: string;
  rating?: number;
  ratingCount?: number;
  googleMapsUrl?: string;
  businessStatus?: string;
  description?: string;
}

export interface ExternalCollegeSearchResponse {
  results: ExternalCollege[];
  providerConfigured: boolean;
  source: ExternalCollege["source"];
  message?: string;
}
