import { deepseek, DeepSeekClient } from './deepseek'
import type { ChatMessage, InvokeOptions, InvokeResult } from './interfaces'

export class AIInvoker {
  private client: DeepSeekClient
  private defaultOptions: InvokeOptions

  constructor(client?: DeepSeekClient, defaultOptions?: InvokeOptions) {
    this.client = client || deepseek
    this.defaultOptions = {
      retries: 3,
      timeout: 30000,
      temperature: 0.7,
      maxTokens: 4096,
      ...defaultOptions
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: operação excedeu o tempo limite')), timeoutMs)
      )
    ])
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number,
    delay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        if (attempt === retries) {
          throw error
        }
        
        const backoffDelay = delay * Math.pow(2, attempt - 1)
        console.warn(`Tentativa ${attempt} falhou, tentando novamente em ${backoffDelay}ms...`)
        await new Promise(resolve => setTimeout(resolve, backoffDelay))
      }
    }
    
    throw new Error('Todas as tentativas falharam')
  }

  async invoke(
    prompt: string, 
    options?: InvokeOptions
  ): Promise<InvokeResult> {
    const startTime = Date.now()
    const config = { ...this.defaultOptions, ...options }
    let retriesUsed = 0

    try {
      const result = await this.executeWithRetry(async () => {
        retriesUsed++
        
        const operation = this.client.simpleChat(prompt, config.systemMessage)
        return await this.withTimeout(operation, config.timeout!)
      }, config.retries!)

      const duration = Date.now() - startTime

      return {
        success: true,
        data: result,
        metadata: {
          model: config.model || 'deepseek-chat',
          duration,
          retries: retriesUsed - 1
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'

      return {
        success: false,
        error: errorMessage,
        metadata: {
          model: config.model || 'deepseek-chat',
          duration,
          retries: retriesUsed - 1
        }
      }
    }
  }

  async invokeWithHistory(
    newMessage: string,
    history: ChatMessage[] = [],
    options?: InvokeOptions
  ): Promise<InvokeResult<{ response: string; updatedHistory: ChatMessage[] }>> {
    const startTime = Date.now()
    const config = { ...this.defaultOptions, ...options }
    let retriesUsed = 0

    try {
      const result = await this.executeWithRetry(async () => {
        retriesUsed++
        
        const operation = this.client.chatWithHistory(newMessage, history, config.systemMessage)
        return await this.withTimeout(operation, config.timeout!)
      }, config.retries!)

      const duration = Date.now() - startTime

      return {
        success: true,
        data: result,
        metadata: {
          model: config.model || 'deepseek-chat',
          duration,
          retries: retriesUsed - 1
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'

      return {
        success: false,
        error: errorMessage,
        metadata: {
          model: config.model || 'deepseek-chat',
          duration,
          retries: retriesUsed - 1
        }
      }
    }
  }

  async invokeStructured<T>(
    prompt: string,
    parser: (response: string) => T,
    options?: InvokeOptions
  ): Promise<InvokeResult<T>> {
    const result = await this.invoke(prompt, options)
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error,
        metadata: result.metadata
      }
    }

    try {
      const parsedData = parser(result.data)
      return {
        success: true,
        data: parsedData,
        metadata: result.metadata
      }
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Erro de parsing'
      return {
        success: false,
        error: `Erro ao processar resposta: ${errorMessage}`,
        metadata: result.metadata
      }
    }
  }
}

export const ai = new AIInvoker()

export function createInvoker(options?: InvokeOptions): AIInvoker {
  return new AIInvoker(undefined, options)
}
