const path = require("path")

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@lifeboard/ui-web",
    "@lifeboard/lib",
    "@lifeboard/types",
    "@lifeboard/validations",
  ],
  serverExternalPackages: ["pdfjs-dist"],
  webpack: (config, { isServer }) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src")
    config.resolve.alias["canvas"] = false
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      encoding: false,
    }

    return config
  },
}

module.exports = nextConfig