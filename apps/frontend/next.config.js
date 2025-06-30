/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Optimize for production
  swcMinify: true,

  // Enable experimental features for better performance
  experimental: {
    // Reduce bundle size
    optimizeCss: true,
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

  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle analyzer in production
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, './src'),
      }
    }
    return config
  },
}

const path = require('path')

module.exports = nextConfig
