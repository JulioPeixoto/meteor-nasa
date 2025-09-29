import type { NextConfig } from 'next'

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
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

export default nextConfig