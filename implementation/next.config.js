const path = require("path")

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["stripe"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src")
    return config
  },
}

module.exports = nextConfig
