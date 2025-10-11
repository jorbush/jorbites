/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "avatars.githubusercontent.com",
        },
        {
          protocol: "https",
          hostname: "lh3.googleusercontent.com",
        },
        {
          protocol: "https",
          hostname: "res.cloudinary.com",
        },
        {
          protocol: "https",
          hostname: "img.youtube.com",
        }
      ],
      formats: ['image/avif', 'image/webp'],
      minimumCacheTTL: 31536000,
    },
    async headers() {
      return [
        {
          source: '/api/image-proxy',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ];
    },
    compress: true,
    poweredByHeader: false,
  };

  module.exports = nextConfig;
