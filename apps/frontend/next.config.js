/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production'
      ? 'https://vocabulary-backend-lm26.onrender.com/api'
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
  // Force standalone output for containerized deployment
  output: 'standalone',
  // Disable static optimization for dynamic pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
