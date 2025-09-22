/**
 * Convert an absolute external image URL to a same-origin proxied URL
 * so that DOM-to-image export won't be blocked by CORS.
 */
export function getProxiedImageUrl(url?: string): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.protocol === 'http:' || u.protocol === 'https:') {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  } catch {
    return url;
  }
}

