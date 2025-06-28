/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
  // Disable static optimization for pages with dynamic content
  output: 'standalone',
  // Skip static generation for problematic pages
  generateStaticParams: false,
  // Force server-side rendering for dynamic pages
  trailingSlash: false,
}

module.exports = nextConfig
