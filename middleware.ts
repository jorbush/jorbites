import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { logger } from '@/app/lib/axiom/server';
import { transformMiddlewareRequest } from '@axiomhq/nextjs';

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  logger.info(...transformMiddlewareRequest(request));
  event.waitUntil(logger.flush());

  const response = NextResponse.next();
  if (request.nextUrl.pathname.startsWith('/api/image-proxy')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('CDN-Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=31536000, immutable');
  }
  return response;
}

export const config = {
  matcher: [
    '/api/image-proxy/:path*',
    '/((?!api|_next/static|_next/image|favicon.*|sitemap.xml|robots.txt|locales/*|images/*|manifest.json).*)',
  ],
};
