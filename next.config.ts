/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.styl': {
          loaders: ['@turbo/loader-stylus'],
          as: '*.css',
        },
      },
    },
  },
}

module.exports = nextConfig
