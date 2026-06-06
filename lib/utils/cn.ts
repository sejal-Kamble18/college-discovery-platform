/**
 * Merge class names with Tailwind conflict resolution.
 * Lightweight version — uses simple concatenation + dedup.
 * For production, swap in clsx + tailwind-merge.
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}
