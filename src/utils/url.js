/**
 * Returns a normalized HTTP(S) URL or null for an empty/unsafe value.
 * External links are user-editable, so they must never be rendered directly.
 */
export function getSafeExternalUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
