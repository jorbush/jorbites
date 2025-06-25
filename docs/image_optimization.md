# Image Optimization

This documentation explains the implementation of advanced image optimization techniques used in Jorbites, including our custom image proxy system that replaces Next.js Image component to avoid limitations and third-party cookies.

## Table of Contents

1. [Image Proxy Implementation](#image-proxy-implementation)
2. [Migration from Next.js Image](#migration-from-nextjs-image)
3. [Caching Strategy](#caching-strategy)
4. [Skeleton Loading Components](#skeleton-loading-components)
5. [LCP Optimization](#lcp-optimization)

## Image Proxy Implementation

### Problems Addressed

The custom image proxy system was developed to address several limitations:

1. **Next.js Image Limitations:** Vercel Hobby plan has a 1,000 optimized image limit per month
2. **Third-party Cookies:** Direct Cloudinary usage sets third-party cookies, failing Lighthouse audits
3. **Performance:** Better control over caching and optimization parameters
4. **Cost Efficiency:** Avoiding Vercel's image optimization costs

## Migration from Next.js Image

We are actively migrating away from Next.js Image component to our custom solution:

**Current Status:**
- ✅ Recipe images: Fully migrated to CustomProxyImage component
- ✅ User avatars: Fully migrated to CustomProxyImage component
- 🔄 Some legacy components: Still using Next.js Image (being migrated)
- ✅ New features: All use CustomProxyImage component

**Migration Benefits:**
- No monthly image optimization limits
- Improved Lighthouse scores (eliminates third-party cookies)
- Better caching control
- Reduced costs on Vercel platform

### Solution

We implemented a server-side proxy that:

1. Receives image requests from the client
2. Makes the request to Cloudinary from the server
3. Applies optimization parameters
4. Returns the image data as a first-party resource

```typescript name=app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get parameters from query string
  const url = request.nextUrl.searchParams.get('url');
  const width = request.nextUrl.searchParams.get('w') || '400';
  const height = request.nextUrl.searchParams.get('h') || '400';
  const quality = request.nextUrl.searchParams.get('q') || 'auto:good';

  if (!url) {
    return new Response('URL parameter is required', { status: 400 });
  }

  try {
    let imageUrl = url;

    // Process Cloudinary URLs to apply optimizations
    if (url.includes('cloudinary.com')) {
      try {
        const cloudinaryRegex = /^(https?:\/\/res\.cloudinary\.com\/[^\/]+)\/image\/upload(?:\/([^\/]+))?\/(.+)$/;
        const matches = url.match(cloudinaryRegex);

        if (matches) {
          const [, baseUrl, _, imagePath] = matches;

          // Create optimized URL with appropriate parameters
          imageUrl = `${baseUrl}/image/upload/f_auto,q_${quality},w_${width},h_${height},c_fill/${imagePath}`;
        }
      } catch (error) {
        console.error('[Image Proxy] Error parsing Cloudinary URL:', error);
      }
    }

    // Fetch the image from the source
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Image Proxy',
        'Accept': 'image/webp,image/avif,image/*',
      },
      cache: 'force-cache',
      next: {
        revalidate: 60 * 60 * 24 * 7 // Revalidate weekly
      }
    });

    if (!imageResponse.ok) {
      return new Response(`Failed to fetch image: ${imageResponse.statusText}`, {
        status: imageResponse.status
      });
    }

    // Return the image with appropriate headers
    const imageData = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('Content-Type') || 'image/jpeg';

    return new NextResponse(imageData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('[Image Proxy] Unhandled error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

### Client Component Integration

The CustomProxyImage component uses this proxy to load images:

```typescript name=app/components/ui/CustomProxyImage.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

interface CustomProxyImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  preloadViaProxy?: boolean;
}

export default function CustomProxyImage({
  src,
  alt,
  fill = false,
  className = '',
  priority = false,
  width = 400,
  height = 400,
  sizes = "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 250px",
  preloadViaProxy = false
}: CustomProxyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null);
  const [placeholderSrc, setPlaceholderSrc] = useState<string | null>(null);

  // Convert Cloudinary URL to proxy URL
  useEffect(() => {
    const fallbackImage = '/avocado.webp';

    if (!src || src === '') {
      setOptimizedSrc(fallbackImage);
      setPlaceholderSrc(fallbackImage);
      return;
    }

    // For local images, use directly
    if (src.startsWith('/')) {
      setOptimizedSrc(src);
      setPlaceholderSrc(src);
      return;
    }

    // For Cloudinary images, use the proxy
    if (src.includes('cloudinary.com')) {
      try {
        // URL for the full image
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(src)}&w=${width}&h=${height}&q=auto:good`;

        // URL for the placeholder (smaller, blurry)
        const placeholderUrl = `/api/image-proxy?url=${encodeURIComponent(src)}&w=20&h=20&q=auto:eco`;

        setOptimizedSrc(proxyUrl);
        setPlaceholderSrc(placeholderUrl);

        // Preload LCP image if needed
        if (preloadViaProxy && typeof window !== 'undefined') {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = proxyUrl;
          link.as = 'image';
          link.fetchPriority = 'high';
          document.head.appendChild(link);
        }

        return;
      } catch (e) {
        console.error('Error creating proxy URL:', e);
        setOptimizedSrc(fallbackImage);
        setPlaceholderSrc(fallbackImage);
      }
    }

    // Fallback to original URL
    setOptimizedSrc(src);
    setPlaceholderSrc(src);
  }, [src, width, height, preloadViaProxy]);

  // Set high fetch priority for LCP images
  useEffect(() => {
    if (imgRef.current && priority) {
      imgRef.current.setAttribute('fetchpriority', 'high');
      imgRef.current.setAttribute('loading', 'eager');
      imgRef.current.setAttribute('decoding', 'sync');
      imgRef.current.id = 'lcp-image';
    }
  }, [priority]);

  // Styling based on fill mode
  const baseStyle = fill ? {
    position: 'absolute',
    width: '100%',
    height: '100%',
    inset: 0,
    objectFit: 'cover'
  } as React.CSSProperties : {
    width,
    height
  };

  // Only render if we have a valid source
  if (!optimizedSrc) {
    return (
      <div
        className={`${fill ? 'relative aspect-square' : ''} bg-gray-200 dark:bg-gray-700 overflow-hidden ${fill ? className : ''}`}
        style={!fill ? { width, height } : undefined}
      />
    );
  }

  return (
    <div className={`${fill ? 'relative aspect-square' : ''} bg-gray-200 dark:bg-gray-700 overflow-hidden ${fill ? className : ''}`}>
      {/* Blurry placeholder */}
      {!isLoaded && placeholderSrc && (
        <div
          style={{
            ...baseStyle,
            backgroundImage: `url(${placeholderSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px)',
            transform: 'scale(1.05)'
          }}
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoaded(true)}
        style={baseStyle}
        sizes={sizes}
        className={`${className} ${fill ? 'object-cover' : ''} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
```

## Caching Strategy

Our image caching strategy operates on multiple levels:

### 1. Server-Side Caching

- **Route Handler Caching**: Using Next.js built-in cache with revalidate options
- **Middleware Cache Headers**: Setting aggressive cache control headers

```typescript name=middleware.ts
// In middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/api/image-proxy')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('CDN-Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=31536000, immutable');
  }

  return response;
}
```

### 2. Edge and CDN Caching

- Setting `immutable` in cache headers to prevent revalidation
- 1-year max-age for optimal CDN caching

### 3. Browser Caching

- Long-term browser caching of served images
- Proper content-type headers for browser optimizations

### 4. Image Optimization Parameters

- Format optimization with `f_auto` (WebP or AVIF when supported)
- Quality optimization with `q_auto:good`
- Responsive sizing with width/height parameters

## Skeleton Loading Components

Skeleton loading improves perceived performance by showing placeholder content while data is being loaded.

### Implementation

```typescript name=app/components/recipes/RecipeCardSkeleton.tsx
export default function RecipeCardSkeleton() {
  return (
    <div className="col-span-1 cursor-pointer group">
      <div className="flex flex-col gap-2 w-full">
        <div className="
          aspect-square
          w-full
          relative
          overflow-hidden
          rounded-xl
          bg-gray-200
          animate-pulse
        "/>
        <div className="flex flex-row items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="w-20 h-4 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
      </div>
    </div>
  );
}
```

### Usage in Main Content

```typescript
// In page component
const RecipeGrid = () => (
  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
    {Array(12).fill(0).map((_, i) => (
      <RecipeCardSkeleton key={i} />
    ))}
  </div>
);

// Then in the component
<ClientOnly fallback={
  <Container>
    <section aria-label="Loading" className="min-h-[60vh]">
      <RecipeGrid />
    </section>
  </Container>
}>
  {/* Actual content */}
</ClientOnly>
```

## LCP Optimization

Largest Contentful Paint (LCP) is a critical web performance metric. We optimize it through:

### 1. Dedicated LCP Preloader

```typescript name=app/components/LcpPreloader.tsx
'use client';

import { useEffect } from 'react';

interface LcpPreloaderProps {
  imageUrl: string;
}

export default function LcpPreloader({ imageUrl }: LcpPreloaderProps) {
  useEffect(() => {
    if (!imageUrl || typeof window === 'undefined') return;

    const injectProxyPreload = () => {
      try {
        // Remove existing preloads to avoid duplicates
        document.querySelectorAll(`link[rel="preload"][as="image"][href*="api/image-proxy"]`)
          .forEach(el => el.remove());

        // Create proxy URL instead of direct Cloudinary URL
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}&w=400&h=400&q=auto:good`;

        // Create and add preload
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = proxyUrl;
        preloadLink.setAttribute('fetchpriority', 'high');
        document.head.appendChild(preloadLink);
      } catch (e) {
        console.error('Error injecting preload:', e);
      }
    };

    // Execute immediately
    injectProxyPreload();

    // Also right after DOM is ready
    if (document.readyState !== 'complete') {
      window.addEventListener('DOMContentLoaded', injectProxyPreload);
      return () => window.removeEventListener('DOMContentLoaded', injectProxyPreload);
    }
  }, [imageUrl]);

  return null;
}
```

### 2. Priority Attributes

- `fetchpriority="high"` for LCP images
- `loading="eager"` to disable lazy loading for important images
- `decoding="sync"` to prioritize decoding

### 3. Image Processing Pipeline

1. **Identification**: First image is identified as LCP candidate
2. **Preloading**: Proactively loaded before the rest of the content
3. **Optimization**: Served with optimal quality/size parameters
4. **Placeholder**: Low-quality blurred placeholder shown during loading
