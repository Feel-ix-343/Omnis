/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
    // typedRoutes: true
  },
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig
