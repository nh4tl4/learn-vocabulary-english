/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Optimize for production
  swcMinify: true,

  // Remove experimental optimizeCss as it's causing issues
  experimental: {
    // Remove optimizeCss - this might be causing the critters error
  },

  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Compression
  compress: true,

  // Power optimizations for serverless
  poweredByHeader: false,

  // Simplified webpack config
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Add any necessary webpack optimizations here
    }
    return config;
  },
};

module.exports = nextConfig;
