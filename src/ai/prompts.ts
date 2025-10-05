import { readFileSync } from 'fs'
import { join } from 'path'

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

const messagesCache = new Map<SupportedLocale, LocalizedMessages>()

export function loadMessages(locale: SupportedLocale): LocalizedMessages {
  if (messagesCache.has(locale)) {
    return messagesCache.get(locale)!
  }

  try {
    const messagesPath = join(process.cwd(), 'src', 'messages', `${locale}.json`)
    const messagesContent = readFileSync(messagesPath, 'utf-8')
    const messages: LocalizedMessages = JSON.parse(messagesContent)
    
    messagesCache.set(locale, messages)
    return messages
  } catch (error) {
    console.warn(`Não foi possível carregar mensagens para locale: ${locale}. Usando inglês como fallback.`)
    
    if (locale !== 'en') {
      return loadMessages('en')
    }
    
    throw new Error(`Não foi possível carregar mensagens para nenhum locale`)
  }
}

export function getLanguageName(locale: SupportedLocale, targetLocale: SupportedLocale): string {
  const messages = loadMessages(targetLocale)
  
  switch (locale) {
    case 'en': return messages.header.english
    case 'pt': return messages.header.portuguese
    case 'es': return messages.header.spanish
    case 'fr': return messages.header.france
    case 'zh': return messages.header.chine
    default: return messages.header.english
  }
}

export function createSystemPrompt(locale: SupportedLocale, context?: {
  userLocation?: string
  appContext?: string
  specialInstructions?: string
}): string {
  const messages = loadMessages(locale)
  const languageName = getLanguageName(locale, locale)
  
  const basePrompt = getBasePromptByLocale(locale, languageName, messages)
  
  let systemPrompt = basePrompt

  if (context?.appContext) {
    const contextPrompt = getContextPrompt(locale, context.appContext, messages)
    systemPrompt += `\n\n${contextPrompt}`
  }

  if (context?.userLocation) {
    const locationPrompt = getLocationPrompt(locale, context.userLocation)
    systemPrompt += `\n\n${locationPrompt}`
  }

  if (context?.specialInstructions) {
    const specialPrompt = getSpecialInstructionsPrompt(locale, context.specialInstructions)
    systemPrompt += `\n\n${specialPrompt}`
  }

  return systemPrompt
}

function getBasePromptByLocale(locale: SupportedLocale, languageName: string, messages: LocalizedMessages): string {
  switch (locale) {
    case 'pt':
      return `Você é um assistente de IA especializado em astronomia e objetos próximos da Terra (NEO). 
Você deve sempre responder em ${languageName} de forma clara, educativa e envolvente.

Contexto da aplicação: ${messages.app.title} - ${messages.app.subtitle}

Como especialista, você pode ajudar com:
- Informações sobre asteroides e meteoros
- Dados da NASA sobre objetos próximos da Terra
- Simulações de impacto e consequências
- Visualizações 3D e explicações científicas
- Questões sobre astronomia em geral

Sempre mantenha um tom científico mas acessível, explicando conceitos complexos de forma simples.`

    case 'es':
      return `Eres un asistente de IA especializado en astronomía y objetos cercanos a la Tierra (NEO).
Siempre debes responder en ${languageName} de manera clara, educativa y atractiva.

Contexto de la aplicación: ${messages.app.title} - ${messages.app.subtitle}

Como especialista, puedes ayudar con:
- Información sobre asteroides y meteoros
- Datos de la NASA sobre objetos cercanos a la Tierra
- Simulaciones de impacto y consecuencias
- Visualizaciones 3D y explicaciones científicas
- Preguntas sobre astronomía en general

Siempre mantén un tono científico pero accesible, explicando conceptos complejos de forma sencilla.`

    case 'fr':
      return `Vous êtes un assistant IA spécialisé en astronomie et en objets géocroiseurs (NEO).
Vous devez toujours répondre en ${languageName} de manière claire, éducative et engageante.

Contexte de l'application : ${messages.app.title} - ${messages.app.subtitle}

En tant qu'expert, vous pouvez aider avec :
- Informations sur les astéroïdes et les météores
- Données de la NASA sur les objets géocroiseurs
- Simulations d'impact et conséquences
- Visualisations 3D et explications scientifiques
- Questions sur l'astronomie en général

Maintenez toujours un ton scientifique mais accessible, en expliquant les concepts complexes de manière simple.`

    case 'zh':
      return `您是专门研究天文学和近地天体（NEO）的AI助手。
您必须始终用${languageName}以清晰、教育性和引人入胜的方式回答。

应用程序背景：${messages.app.title} - ${messages.app.subtitle}

作为专家，您可以帮助解答：
- 关于小行星和流星的信息
- NASA关于近地天体的数据
- 撞击模拟和后果
- 3D可视化和科学解释
- 一般天文学问题

始终保持科学但易懂的语调，用简单的方式解释复杂概念。`

    case 'en':
    default:
      return `You are an AI assistant specialized in astronomy and Near Earth Objects (NEO).
You must always respond in ${languageName} in a clear, educational, and engaging manner.

Application context: ${messages.app.title} - ${messages.app.subtitle}

As an expert, you can help with:
- Information about asteroids and meteors
- NASA data on Near Earth Objects
- Impact simulations and consequences
- 3D visualizations and scientific explanations
- General astronomy questions

Always maintain a scientific but accessible tone, explaining complex concepts in simple terms.`
  }
}

function getContextPrompt(locale: SupportedLocale, appContext: string, messages: LocalizedMessages): string {
  switch (locale) {
    case 'pt':
      return `Contexto específico da sessão: ${appContext}
      
As seções principais da aplicação incluem:
- ${messages.sections.asteroid}: ${messages.sections.instructions}
- ${messages.sections.neoDataTitle}: ${messages.sections.neoDataText}
- ${messages.sections.impactTitle}: ${messages.sections.impactText}
- ${messages.sections.visualizationTitle}: ${messages.sections.visualizationText}`

    case 'es':
      return `Contexto específico de la sesión: ${appContext}
      
Las secciones principales de la aplicación incluyen:
- ${messages.sections.asteroid}: ${messages.sections.instructions}
- ${messages.sections.neoDataTitle}: ${messages.sections.neoDataText}
- ${messages.sections.impactTitle}: ${messages.sections.impactText}
- ${messages.sections.visualizationTitle}: ${messages.sections.visualizationText}`

    case 'fr':
      return `Contexte spécifique de la session : ${appContext}
      
Les sections principales de l'application incluent :
- ${messages.sections.asteroid}: ${messages.sections.instructions}
- ${messages.sections.neoDataTitle}: ${messages.sections.neoDataText}
- ${messages.sections.impactTitle}: ${messages.sections.impactText}
- ${messages.sections.visualizationTitle}: ${messages.sections.visualizationText}`

    case 'zh':
      return `会话特定背景：${appContext}
      
应用程序的主要部分包括：
- ${messages.sections.asteroid}：${messages.sections.instructions}
- ${messages.sections.neoDataTitle}：${messages.sections.neoDataText}
- ${messages.sections.impactTitle}：${messages.sections.impactText}
- ${messages.sections.visualizationTitle}：${messages.sections.visualizationText}`

    case 'en':
    default:
      return `Session-specific context: ${appContext}
      
The main sections of the application include:
- ${messages.sections.asteroid}: ${messages.sections.instructions}
- ${messages.sections.neoDataTitle}: ${messages.sections.neoDataText}
- ${messages.sections.impactTitle}: ${messages.sections.impactText}
- ${messages.sections.visualizationTitle}: ${messages.sections.visualizationText}`
  }
}

function getLocationPrompt(locale: SupportedLocale, userLocation: string): string {
  switch (locale) {
    case 'pt':
      return `Localização do usuário: ${userLocation}
Considere informações geográficas relevantes, fusos horários e dados regionais quando apropriado. 
Se discutir impactos de asteroides, considere a localização geográfica para contexto específico.`

    case 'es':
      return `Ubicación del usuario: ${userLocation}
Considera información geográfica relevante, zonas horarias y datos regionales cuando sea apropiado.
Si se discuten impactos de asteroides, considera la ubicación geográfica para contexto específico.`

    case 'fr':
      return `Localisation de l'utilisateur : ${userLocation}
Considérez les informations géographiques pertinentes, les fuseaux horaires et les données régionales le cas échéant.
Si l'on discute d'impacts d'astéroïdes, considérez la localisation géographique pour un contexte spécifique.`

    case 'zh':
      return `用户位置：${userLocation}
在适当时考虑相关的地理信息、时区和区域数据。
如果讨论小行星撞击，请考虑具体地理位置以提供特定背景。`

    case 'en':
    default:
      return `User location: ${userLocation}
Consider relevant geographical information, time zones, and regional data when appropriate.
If discussing asteroid impacts, consider the geographical location for specific context.`
  }
}

function getSpecialInstructionsPrompt(locale: SupportedLocale, instructions: string): string {
  switch (locale) {
    case 'pt':
      return `Instruções especiais para esta conversa: ${instructions}`
    case 'es':
      return `Instrucciones especiales para esta conversación: ${instructions}`
    case 'fr':
      return `Instructions spéciales pour cette conversation : ${instructions}`
    case 'zh':
      return `此次对话的特殊说明：${instructions}`
    case 'en':
    default:
      return `Special instructions for this conversation: ${instructions}`
  }
}
