const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel deployment with serverless functions
  images: {
    unoptimized: true, // Keep unoptimized for Sanity images
  },

  // Disable type checking during build (TypeScript errors won't block deployment)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  async redirects() {
    return [
      { source: '/sortiment', destination: '/retailer', permanent: true },
      { source: '/en/sortiment', destination: '/en/retailer', permanent: true },
    ]
  },
}

module.exports = withNextIntl(nextConfig)
