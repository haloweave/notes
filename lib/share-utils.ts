import { nanoid } from 'nanoid';

/**
 * Generate a unique, URL-safe slug for shareable song links
 * Format: 8 characters, URL-safe (alphanumeric + hyphens/underscores)
 */
export function generateShareSlug(): string {
    return nanoid(10); // 10 chars for good uniqueness
}

/**
 * Generate share URL for a song variation
 */
export function getShareUrl(slug: string, baseUrl?: string): string {
    const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || '';
    return `${base}/play/${slug}`;
}
