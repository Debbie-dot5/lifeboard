/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@lifeboard/ui-web",
    "@lifeboard/lib",
    "@lifeboard/types",
    "@lifeboard/validations",
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    return config
  },
}

module.exports = nextConfig