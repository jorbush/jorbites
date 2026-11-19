const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure events & blogs content are synced before Next.js builds
try {
    const eventsDir = path.join(process.cwd(), 'app/content/events');
    const challengesFile = path.join(eventsDir, 'weekly-challenges.json');
    if (
        !process.env._CONTENT_SYNCED &&
        (!fs.existsSync(challengesFile) || process.env.VERCEL)
    ) {
        process.env._CONTENT_SYNCED = 'true';
        console.log('🔄 [next.config.js] Syncing content (events & blogs)...');
        execSync('npx tsx scripts/sync-content.ts', { stdio: 'inherit' });
    }
} catch (err) {
    console.error(
        '❌ [next.config.js] Failed to run sync-content:',
        err.message
    );
    throw err;
}

const cloudinaryApiKey =
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_API_KEY;

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: cloudinaryApiKey
        ? { NEXT_PUBLIC_CLOUDINARY_API_KEY: cloudinaryApiKey }
        : {},
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'img.youtube.com',
            },
            {
                protocol: 'https',
                hostname: 'images.jorbites.com',
            },
            {
                protocol: 'https',
                hostname: 'pub-4c3d704cf6de499a9ef3964908533212.r2.dev',
            },
            ...(process.env.R2_PUBLIC_DOMAIN
                ? [
                      {
                          protocol: 'https',
                          hostname: process.env.R2_PUBLIC_DOMAIN.replace(
                              /^https?:\/\//,
                              ''
                          ).replace(/\/.*$/, ''),
                      },
                  ]
                : []),
        ],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 31536000,
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
                    },
                ],
            },
            {
                source: '/sw.js',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/javascript; charset=utf-8',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self'",
                    },
                ],
            },
            {
                source: '/api/image-proxy',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'none'; sandbox",
                    },
                ],
            },
        ];
    },
    compress: true,
    poweredByHeader: false,
};

module.exports = nextConfig;
