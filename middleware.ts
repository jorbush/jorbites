import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/api/image-proxy')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('CDN-Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=31536000, immutable');
  }

  if (request.nextUrl.pathname.includes('speed-insights') ||
      request.nextUrl.pathname.includes('analytics')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('CDN-Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=31536000, immutable');
  }

  return response;
}

export const config = {
  matcher: [
    '/api/image-proxy/:path*',
    '/_vercel/:path*',
  ],
};
