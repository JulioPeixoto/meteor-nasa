import type { DeepSeekConfig } from './interfaces'

export const defaultConfig: DeepSeekConfig = {
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  maxTokens: 4096,
  temperature: 0.7
}

if (!defaultConfig.apiKey) {
  console.warn('DEEPSEEK_API_KEY não encontrada nas variáveis de ambiente')
}
