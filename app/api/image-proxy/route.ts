import type { NextRequest } from 'next/server';

// Simple server-side image proxy to avoid CORS tainting during DOM-to-image export
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get('url');

  if (!target) {
    return new Response('Missing url parameter', { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return new Response('Invalid url parameter', { status: 400 });
  }

  if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
    return new Response('Unsupported protocol', { status: 400 });
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      // Avoid sending credentials; emulate a normal browser request
      // Some CDNs require a referer; set to origin to be safe
      headers: {
        'User-Agent': 'Mozilla/5.0 (image-proxy)',
        'Accept': 'image/*,*/*;q=0.8',
        'Referer': targetUrl.origin,
      },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(`Upstream error: ${upstream.status}`, { status: upstream.status });
    }

    const headers = new Headers();
    headers.set('Content-Type', upstream.headers.get('content-type') || 'image/jpeg');
    headers.set('Cache-Control', upstream.headers.get('cache-control') || 'public, max-age=86400, immutable');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(upstream.body, { status: 200, headers });
  } catch (err) {
    return new Response('Proxy fetch failed', { status: 502 });
  }
}

