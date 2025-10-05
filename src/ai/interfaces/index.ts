export interface DeepSeekConfig {
  apiKey: string
  baseUrl: string
  model: string
  maxTokens: number
  temperature: number
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
