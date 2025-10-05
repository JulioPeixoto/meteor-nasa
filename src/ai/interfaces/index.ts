export interface DeepSeekConfig {
  apiKey: string
  baseUrl: string
  model: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface DeepSeekResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: ChatMessage
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface InvokeOptions {
  temperature?: number
  maxTokens?: number
  model?: string
  systemMessage?: string
  retries?: number
  timeout?: number
}

export interface InvokeResult<T = string> {
  success: boolean
  data?: T
  error?: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  metadata?: {
    model: string
    duration: number
    retries: number
  }
}

// Interfaces para o sistema de prompts localizados
export type SupportedLocale = 'en' | 'pt' | 'es' | 'fr' | 'zh'

export interface LocalizedMessages {
  app: {
    title: string
    subtitle: string
  }
  header: {
    language: string
    english: string
    portuguese: string
    spanish: string
    france: string
    chine: string
    switch: string
  }
  sections: {
    asteroid: string
    instructions: string
    neoDataTitle: string
    neoDataText: string
    impactTitle: string
    impactText: string
    visualizationTitle: string
    visualizationText: string
  }
}

export interface LocalizedAIOptions extends Omit<InvokeOptions, 'systemMessage'> {
  locale: SupportedLocale
  userLocation?: string
  appContext?: string
  specialInstructions?: string
  sessionId?: string
}
