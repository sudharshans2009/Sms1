/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  // Suppress webpack warnings for leaflet
  transpilePackages: ['react-leaflet', 'leaflet'],
}

module.exports = nextConfig
