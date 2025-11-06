/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Handle leaflet on server side
    if (isServer) {
      config.externals = [...(config.externals || []), 'leaflet', 'react-leaflet'];
    }
    return config;
  },
  // Suppress webpack warnings for leaflet
  transpilePackages: ['react-leaflet', 'leaflet'],
}

module.exports = nextConfig
