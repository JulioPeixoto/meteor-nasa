import { meteorAI, quickAsk, createLocalizedAI, type SupportedLocale } from '@/ai'
import { ChatMessage } from './interfaces'

export async function exemplosDeUso() {
  const userLocation = 'São Paulo, Brasil'
  const locale: SupportedLocale = 'pt'

  console.log('=== EXEMPLOS DE USO DO SISTEMA LOCALIZADO ===\n')

  console.log('1. Consulta Rápida (Quick Ask):')
  try {
    const resposta1 = await quickAsk(
      'O que são asteroides próximos da Terra?',
      locale,
      userLocation
    )
    console.log('Resposta:', resposta1)
  } catch (error) {
    console.error('Erro:', error)
  }

  console.log('\n2. AI Especializada:')
  const expertAI = meteorAI.createExpert(locale, userLocation)
  try {
    const resultado2 = await expertAI.ask(
      'Explique como funciona o sistema de classificação Torino para asteroides'
    )
    if (resultado2.success) {
      console.log('Resposta especializada:', resultado2.data)
      console.log('Metadados:', resultado2.metadata)
    }
  } catch (error) {
    console.error('Erro:', error)
  }

  console.log('\n3. AI Educacional:')
  const eduAI = meteorAI.createEducational(locale, userLocation)
  try {
    const resultado3 = await eduAI.ask(
      'Como posso ver meteoros no céu noturno?'
    )
    if (resultado3.success) {
      console.log('Resposta educacional:', resultado3.data)
    }
  } catch (error) {
    console.error('Erro:', error)
  }

  console.log('\n4. Conversa com Histórico:')
  const ai = meteorAI.createForLocale(locale, userLocation)
  let history = [] as ChatMessage[]
  
  try {
    const pergunta1 = await ai.askWithHistory('Quantos asteroides foram descobertos?', history)
    if (pergunta1.success && pergunta1.data) {
      console.log('P1:', pergunta1.data.response)
      history = pergunta1.data.updatedHistory
      
      const pergunta2 = await ai.askWithHistory('E quantos são considerados perigosos?', history)
      if (pergunta2.success && pergunta2.data) {
        console.log('P2:', pergunta2.data.response)
        history = pergunta2.data.updatedHistory
      }
    }
  } catch (error) {
    console.error('Erro na conversa:', error)
  }

  console.log('\n5. Resposta Estruturada (JSON):')
  const structuredAI = createLocalizedAI({
    locale,
    userLocation,
    appContext: 'Análise de dados de asteroides',
    temperature: 0.3
  })

  try {
    const jsonResult = await structuredAI.askStructured(
      'Liste 3 asteroides famosos com suas características básicas',
      (response) => {
        try {
          return JSON.parse(response)
        } catch {
          return {
            asteroides: response.split('\n').filter(line => line.includes('-')).slice(0, 3)
          }
        }
      }
    )
    
    if (jsonResult.success) {
      console.log('Dados estruturados:', jsonResult.data)
    }
  } catch (error) {
    console.error('Erro estruturado:', error)
  }

  console.log('\n6. Múltiplos Idiomas:')
  const idiomas: SupportedLocale[] = ['pt', 'en', 'es', 'fr', 'zh']
  
  for (const lang of idiomas) {
    try {
      const resposta = await quickAsk('What is a meteor?', lang, userLocation)
      console.log(`${lang.toUpperCase()}:`, resposta.substring(0, 100) + '...')
    } catch (error) {
      console.error(`Erro em ${lang}:`, error)
    }
  }
}

export async function exemploEspecificoMeteorMadness() {
  const locale: SupportedLocale = 'pt'
  const userLocation = 'Rio de Janeiro, Brasil'
  
  const meteorMadnessAI = createLocalizedAI({
    locale,
    userLocation,
    appContext: 'Aplicação Meteor Madness - Simulação de impactos de asteroides',
    specialInstructions: `
      Você está ajudando usuários da aplicação Meteor Madness.
      Foque em:
      - Explicações sobre visualizações 3D
      - Interpretação de dados da NASA
      - Simulações de impacto
      - Consequências regionais considerando a localização do usuário
    `
  })

  console.log('=== EXEMPLO ESPECÍFICO METEOR MADNESS ===\n')

  const perguntas = [
    'Como interpretar os dados NEO que vejo na aplicação?',
    'O que significam as cores diferentes na visualização 3D?',
    'Se um asteroide de 100m atingisse minha região, quais seriam as consequências?',
    'Como a aplicação calcula as trajetórias dos asteroides?'
  ]

  for (const pergunta of perguntas) {
    try {
      console.log(`Pergunta: ${pergunta}`)
      const resultado = await meteorMadnessAI.ask(pergunta)
      
      if (resultado.success) {
        console.log(`Resposta: ${resultado.data}`)
        console.log(`Tempo: ${resultado.metadata?.duration}ms`)
        console.log('---')
      }
    } catch (error) {
      console.error('Erro:', error)
    }
  }
}

export async function exemploMudancaDeIdioma() {
  console.log('=== EXEMPLO DE MUDANÇA DE IDIOMA ===\n')
  
  const ai = meteorAI.createForLocale('en', 'New York, USA')
  
  console.log('Sistema prompt inicial (EN):', ai.getSystemPrompt().substring(0, 200) + '...')
  
  const respostaEN = await ai.ask('What are NEOs?')
  if (respostaEN.success) {
    console.log('Resposta EN:', respostaEN.data)
  }
  
  ai.updateLocale('pt', {
    userLocation: 'São Paulo, Brasil',
    appContext: 'Meteor Madness em Português'
  })
  
  console.log('\nSistema prompt após mudança (PT):', ai.getSystemPrompt().substring(0, 200) + '...')
  
  const respostaPT = await ai.ask('O que são NEOs?')
  if (respostaPT.success) {
    console.log('Resposta PT:', respostaPT.data)
  }
}

if (typeof window === 'undefined') {
  console.log('Para testar, execute:')
  console.log('await exemplosDeUso()')
  console.log('await exemploEspecificoMeteorMadness()')
  console.log('await exemploMudancaDeIdioma()')
}
