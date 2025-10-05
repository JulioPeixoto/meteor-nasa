import type { DeepSeekConfig } from './interfaces'

export const defaultConfig: DeepSeekConfig = {
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
}

if (!defaultConfig.apiKey) {
  console.warn('DEEPSEEK_API_KEY não encontrada nas variáveis de ambiente')
}
