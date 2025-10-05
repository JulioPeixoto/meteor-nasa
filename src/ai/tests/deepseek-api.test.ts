import { describe, test, expect, beforeAll } from '@jest/globals'
import { config } from 'dotenv'
import { join } from 'path'

config({ path: join(process.cwd(), '.env.local') })

describe('DeepSeek Multi-Language Tests', () => {
  const skipIfNoApiKey = () => {
    if (!process.env.DEEPSEEK_API_KEY) {
      console.warn('Pulando teste - DEEPSEEK_API_KEY não configurada')
      return true
    }
    return false
  }

  beforeAll(() => {
    if (!process.env.DEEPSEEK_API_KEY) {
      console.warn('DEEPSEEK_API_KEY não encontrada. Configure no .env.local para executar os testes.')
    } else {
      console.log('✅ DEEPSEEK_API_KEY configurada')
    }
  })

  const languageTests = [
    {
      locale: 'pt',
      name: 'Português',
      systemPrompt: 'Você é um assistente especializado em astronomia. Responda sempre em português de forma educativa e concisa.',
      question: 'O que são asteroides em uma frase?',
      expectedKeywords: ['asteroide', 'corpo', 'rocha', 'celeste', 'espaço', 'órbita']
    },
    {
      locale: 'en', 
      name: 'English',
      systemPrompt: 'You are an astronomy expert. Always respond in English in an educational and concise manner.',
      question: 'What are comets in one sentence?',
      expectedKeywords: ['comet', 'celestial', 'ice', 'orbit', 'space', 'tail']
    },
    {
      locale: 'es',
      name: 'Español', 
      systemPrompt: 'Eres un experto en astronomía. Responde siempre en español de manera educativa y concisa.',
      question: '¿Qué son los meteoros en una oración?',
      expectedKeywords: ['meteoro', 'atmósfera', 'espacio', 'estrella', 'fugaz', 'cielo']
    },
    {
      locale: 'fr',
      name: 'Français',
      systemPrompt: 'Vous êtes un expert en astronomie. Répondez toujours en français de manière éducative et concise.',
      question: 'Que sont les astéroïdes en une phrase?',
      expectedKeywords: ['astéroïde', 'corps', 'céleste', 'orbite', 'espace', 'roche']
    },
    {
      locale: 'zh',
      name: '中文',
      systemPrompt: '您是天文学专家。请始终用中文以教育性和简洁的方式回答。',
      question: '什么是彗星？请用一句话回答。',
      expectedKeywords: ['彗星', '天体', '轨道', '太阳', '冰', '尾巴']
    }
  ]

  test.each(languageTests)(
    'should respond correctly in $name ($locale)',
    async ({ locale, name, systemPrompt, question, expectedKeywords }) => {
      if (skipIfNoApiKey()) return

      console.log(`🌍 Testando ${name} (${locale})...`)

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user', 
              content: question
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      })

      expect(response.ok).toBe(true)
      expect(response.status).toBe(200)

      const data = await response.json()
      
      expect(data).toHaveProperty('choices')
      expect(data.choices).toHaveLength(1)
      expect(data.choices[0]).toHaveProperty('message')
      expect(data.choices[0].message).toHaveProperty('content')

      const content = data.choices[0].message.content
      expect(content).toBeTruthy()
      expect(content.length).toBeGreaterThan(10)

      console.log(`📝 ${name}: ${content}`)

      // Verificar se a resposta contém pelo menos uma palavra-chave esperada
      const lowerContent = content.toLowerCase()
      const hasExpectedKeyword = expectedKeywords.some(keyword => 
        lowerContent.includes(keyword.toLowerCase())
      )
      
      if (!hasExpectedKeyword) {
        console.warn(`⚠️  Resposta pode não conter palavras-chave esperadas para ${name}: ${content}`)
        // Não falhar o teste, apenas avisar
      }

      // Verificar informações de uso
      expect(data).toHaveProperty('usage')
      expect(data.usage.total_tokens).toBeGreaterThan(0)
      
      console.log(`📊 Tokens usados: ${data.usage.total_tokens}`)
    },
    20000 // 20 segundos de timeout por teste
  )

  test('should handle all languages in sequence', async () => {
    if (skipIfNoApiKey()) return

    console.log('🚀 Testando todos os idiomas em sequência...')

    const results = []

    for (const lang of languageTests) {
      try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: lang.systemPrompt },
              { role: 'user', content: lang.question }
            ],
            max_tokens: 100,
            temperature: 0.7
          })
        })

        const data = await response.json()
        results.push({
          locale: lang.locale,
          name: lang.name,
          success: response.ok,
          content: data.choices?.[0]?.message?.content || 'No response',
          tokens: data.usage?.total_tokens || 0
        })

        // Pequena pausa entre requests
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        results.push({
          locale: lang.locale,
          name: lang.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Verificar resultados
    expect(results.length).toBe(languageTests.length)
    
    const successfulTests = results.filter(r => r.success)
    console.log(`✅ ${successfulTests.length}/${results.length} idiomas testados com sucesso`)

    // Imprimir resumo
    results.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.name}: ${result.content.substring(0, 80)}...`)
      } else {
        console.log(`❌ ${result.name}: ${result.error || 'Falhou'}`)
      }
    })

    // Pelo menos 80% dos idiomas devem funcionar
    expect(successfulTests.length / results.length).toBeGreaterThanOrEqual(0.8)
  }, 45000)
})
