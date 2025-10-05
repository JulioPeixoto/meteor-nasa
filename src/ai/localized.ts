import { AIInvoker, createInvoker } from './invoke'
import { createSystemPrompt } from './prompts'
import type { 
  ChatMessage, 
  InvokeOptions, 
  InvokeResult, 
  SupportedLocale,
  LocalizedAIOptions 
} from './interfaces'

export class LocalizedAI {
  private invoker: AIInvoker
  private locale: SupportedLocale
  private systemPrompt: string

  constructor(options: LocalizedAIOptions) {
    this.locale = options.locale
    this.invoker = createInvoker({
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      model: options.model,
      retries: options.retries,
      timeout: options.timeout
    })

    this.systemPrompt = createSystemPrompt(options.locale, {
      userLocation: options.userLocation,
      appContext: options.appContext,
      specialInstructions: options.specialInstructions
    })
  }

  async ask(question: string, options?: Omit<InvokeOptions, 'systemMessage'>): Promise<InvokeResult> {
    return this.invoker.invoke(question, {
      ...options,
      systemMessage: this.systemPrompt
    })
  }

  async askWithHistory(
    question: string,
    history: ChatMessage[] = [],
    options?: Omit<InvokeOptions, 'systemMessage'>
  ): Promise<InvokeResult<{ response: string; updatedHistory: ChatMessage[] }>> {
    return this.invoker.invokeWithHistory(question, history, {
      ...options,
      systemMessage: this.systemPrompt
    })
  }

  async askStructured<T>(
    question: string,
    parser: (response: string) => T,
    options?: Omit<InvokeOptions, 'systemMessage'>
  ): Promise<InvokeResult<T>> {
    return this.invoker.invokeStructured(question, parser, {
      ...options,
      systemMessage: this.systemPrompt
    })
  }

  updateLocale(locale: SupportedLocale, context?: {
    userLocation?: string
    appContext?: string
    specialInstructions?: string
  }): void {
    this.locale = locale
    this.systemPrompt = createSystemPrompt(locale, context)
  }

  getSystemPrompt(): string {
    return this.systemPrompt
  }

  getLocale(): SupportedLocale {
    return this.locale
  }
}

export function createLocalizedAI(options: LocalizedAIOptions): LocalizedAI {
  return new LocalizedAI(options)
}

export const meteorAI = {
  createForLocale: (locale: SupportedLocale, userLocation?: string) => 
    createLocalizedAI({
      locale,
      userLocation,
      appContext: 'Meteor Madness - Aplicação de visualização de asteroides e objetos próximos da Terra',
      temperature: 0.7,
      maxTokens: 4096
    }),

  createExpert: (locale: SupportedLocale, userLocation?: string) =>
    createLocalizedAI({
      locale,
      userLocation,
      appContext: 'Consulta especializada sobre astronomia e NEOs',
      specialInstructions: 'Forneça respostas detalhadas e técnicas, mas sempre explicando termos complexos.',
      temperature: 0.3,
      maxTokens: 6144
    }),

  createEducational: (locale: SupportedLocale, userLocation?: string) =>
    createLocalizedAI({
      locale,
      userLocation,
      appContext: 'Explicações educacionais sobre astronomia para público geral',
      specialInstructions: 'Use linguagem simples e acessível, com analogias quando apropriado.',
      temperature: 0.8,
      maxTokens: 4096
    })
}

export async function quickAsk(
  question: string,
  locale: SupportedLocale = 'en',
  userLocation?: string
): Promise<string> {
  const localizedAI = meteorAI.createForLocale(locale, userLocation)
  const result = await localizedAI.ask(question)
  
  if (result.success && result.data) {
    return result.data
  }
  
  throw new Error(result.error || 'Erro desconhecido na consulta')
}

export { type SupportedLocale } from './interfaces'