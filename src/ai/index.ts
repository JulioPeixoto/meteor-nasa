export { deepseek, DeepSeekClient } from './deepseek'
export { ai, AIInvoker, createInvoker } from './invoke'
export { defaultConfig } from './config'
export { 
  LocalizedAI, 
  createLocalizedAI, 
  meteorAI, 
  quickAsk 
} from './localized'
export { 
  loadMessages, 
  getLanguageName, 
  createSystemPrompt 
} from './prompts'
export type { 
  DeepSeekConfig, 
  ChatMessage, 
  DeepSeekResponse,
  InvokeOptions, 
  InvokeResult,
  SupportedLocale,
  LocalizedMessages,
  LocalizedAIOptions
} from './interfaces'