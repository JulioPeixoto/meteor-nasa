import { defaultConfig } from './config'
import type { DeepSeekConfig, ChatMessage, DeepSeekResponse } from './interfaces'

export class DeepSeekClient {
  private config: DeepSeekConfig

  constructor(config?: Partial<DeepSeekConfig>) {
    this.config = { ...defaultConfig, ...config }
    
    if (!this.config.apiKey) {
      throw new Error('DeepSeek API key é obrigatória')
    }
  }

  async chat(messages: ChatMessage[], options?: {
    temperature?: number
    maxTokens?: number
    model?: string
  }): Promise<DeepSeekResponse> {
    const url = `${this.config.baseUrl}/chat/completions`
    
    const requestBody = {
      model: options?.model || this.config.model,
      messages,
      max_tokens: options?.maxTokens || this.config.maxTokens,
      temperature: options?.temperature !== undefined ? options.temperature : this.config.temperature,
      stream: false
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`DeepSeek API error (${response.status}): ${errorData}`)
      }

      const data: DeepSeekResponse = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao chamar DeepSeek API:', error)
      throw error
    }
  }

  async simpleChat(prompt: string, systemMessage?: string): Promise<string> {
    const messages: ChatMessage[] = []
    
    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage })
    }
    
    messages.push({ role: 'user', content: prompt })

    const response = await this.chat(messages)
    
    if (response.choices && response.choices.length > 0) {
      return response.choices[0].message.content
    }
    
    throw new Error('Nenhuma resposta válida recebida da API')
  }

  async chatWithHistory(
    newMessage: string, 
    history: ChatMessage[] = [], 
    systemMessage?: string
  ): Promise<{ response: string; updatedHistory: ChatMessage[] }> {
    const messages: ChatMessage[] = []
    
    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage })
    }
    
    messages.push(...history)
    messages.push({ role: 'user', content: newMessage })

    const response = await this.chat(messages)
    
    if (response.choices && response.choices.length > 0) {
      const assistantMessage = response.choices[0].message.content
      const updatedHistory: ChatMessage[] = [
        ...history,
        { role: 'user', content: newMessage },
        { role: 'assistant', content: assistantMessage }
      ]
      
      return {
        response: assistantMessage,
        updatedHistory
      }
    }
    
    throw new Error('Nenhuma resposta válida recebida da API')
  }
}

export const deepseek = new DeepSeekClient()
