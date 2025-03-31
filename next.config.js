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
  // Add aggressive code-splitting configuration
  webpack: (config, { dev, isServer }) => {
    // Only modify client-side bundle
    if (!isServer) {
      // Override splitChunks configuration
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          // Framework and common chunks
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next|@next|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // UI components
          uiComponents: {
            test: /[\\/]components[\\/]ui[\\/]/,
            name: 'ui-components',
            priority: 15,
          },
          // Modal components
          modals: {
            test: /[\\/]components[\\/]modals[\\/]/,
            name: 'modals',
            priority: 10,
          },
          // Libraries that we don't want to load initially
          heavyLibs: {
            test: /[\\/]node_modules[\\/](react-icons|date-fns|i18next)[\\/]/,
            name: 'heavy-libs',
            priority: 20,
          },
          // Everything else from node_modules
          vendor: {
            name: (module) => {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1] || 'vendor';
              return `npm.${packageName.replace('@', '')}`;
            },
            test: /[\\/]node_modules[\\/]/,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;
