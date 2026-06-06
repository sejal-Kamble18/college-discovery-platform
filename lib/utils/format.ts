/**
 * Format a number as Indian Rupees (₹).
 * Example: 450000 → "₹4.5L"
 */
export function formatFees(amount: number): string {
  if (amount >= 10_000_000) {
    return `₹${(amount / 10_000_000).toFixed(1)}Cr`;
  }
  if (amount >= 100_000) {
    return `₹${(amount / 100_000).toFixed(1)}L`;
  }
  if (amount >= 1_000) {
    return `₹${(amount / 1_000).toFixed(1)}K`;
  }
  return `₹${amount}`;
}

/**
 * Format fees with full precision for detail pages.
 * Example: 450000 → "₹4,50,000"
 */
export function formatFeesDetailed(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Format NIRF rank with ordinal suffix.
 * Example: 1 → "#1", 23 → "#23"
 */
export function formatRank(rank: number | null): string {
  if (rank === null || rank === undefined) return 'N/A';
  return `#${rank}`;
}

/**
 * Format a rating number.
 * Example: 4.3 → "4.3/5"
 */
export function formatRating(rating: number): string {
  return `${rating.toFixed(1)}/5`;
}

/**
 * Format placement package in LPA.
 * Example: 12.5 → "₹12.5 LPA"
 */
export function formatPackage(lpa: number): string {
  return `₹${lpa.toFixed(1)} LPA`;
}

/**
 * Format a percentage.
 * Example: 95.5 → "95.5%"
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format large numbers with K/L/Cr suffix.
 * Example: 15000 → "15K"
 */
export function formatNumber(num: number): string {
  if (num >= 10_000_000) return `${(num / 10_000_000).toFixed(1)}Cr`;
  if (num >= 100_000) return `${(num / 100_000).toFixed(1)}L`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Generate search tokens from a college's data for Firestore array-contains queries.
 */
export function generateSearchTokens(
  name: string,
  shortName: string,
  city: string,
  state: string,
  type: string,
  category: string,
): string[] {
  const tokenize = (str: string): string[] =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((t) => t.length > 1);

  const tokens = new Set<string>();

  tokenize(name).forEach((t) => tokens.add(t));
  tokenize(shortName).forEach((t) => tokens.add(t));
  tokens.add(city.toLowerCase());
  tokens.add(state.toLowerCase());
  tokens.add(type.toLowerCase());
  tokens.add(category.toLowerCase());

  return Array.from(tokens);
}
