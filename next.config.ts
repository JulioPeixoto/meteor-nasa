import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  experimental: {
    turbo: {}  // isso ajuda em Next 15 com o plugin do next-intl
  }
}

const withNextIntl = createNextIntlPlugin({
  // se renomear ou mover o arquivo de config, especifique aqui:
  // default: './i18n/request.ts'
})

export default withNextIntl(nextConfig)
