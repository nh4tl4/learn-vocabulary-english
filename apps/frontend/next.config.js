/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Remove experimental config that might interfere
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  // Optimize for production
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production'
      ? 'https://vocabulary-backend-lm26.onrender.com/api'
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },

  // Remove image optimization config that might cause issues
  images: {
    remotePatterns: [],
  },
}

module.exports = nextConfig
