import { NextResponse } from 'next/server'
import { createLocalizedAI } from '@/ai/localized'
import type { ChatMessage, SupportedLocale } from '@/ai/interfaces'

type ConsequenceZone = {
  name: string
  severity: string
  radiusKm: number
  casualties: number
  description?: string
}

function summarizeConsequences(zones: ConsequenceZone[] = []): string {
  if (!zones.length) return 'Sem dados de consequências fornecidos.'
  const items = zones
    .slice(0, 5)
    .map((z) => `${z.name} (gravidade: ${z.severity}, raio: ${z.radiusKm.toFixed(1)} km, casualidades: ${z.casualties}%)`)
    .join('; ')
  return `Zonas consideradas: ${items}. Foque em estratégias proporcionais por gravidade e distância.`
}

export async function POST(req: Request) {
  const start = Date.now()
  const traceId = Math.random().toString(36).slice(2, 10)
  try {
    // Validate DeepSeek API key presence early to avoid throw/retries in invoker
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('[mitigation-chat] missing-api-key', { traceId })
      return NextResponse.json({ error: 'Serviço de IA não configurado (DEEPSEEK_API_KEY ausente).' }, { status: 503 })
    }

    const body = await req.json()
    const message: string = body?.message || ''
    const history: ChatMessage[] = body?.history || []
    const consequences: ConsequenceZone[] = body?.consequences || []
    const locale: SupportedLocale = (body?.locale || 'pt') as SupportedLocale

    const preview = (s: string, n = 80) => (s || '').toString().slice(0, n).replace(/\n/g, ' ')
    console.info('[mitigation-chat] start', {
      traceId,
      locale,
      messagePreview: preview(message),
      historyLen: history.length,
      zones: consequences.length,
    })

    if (!message || typeof message !== 'string') {
      console.warn('[mitigation-chat] invalid-message', { traceId })
      return NextResponse.json({ error: 'Mensagem inválida' }, { status: 400 })
    }

    const contextSummary = summarizeConsequences(consequences)
    console.debug('[mitigation-chat] context-summary', {
      traceId,
      summaryPreview: preview(contextSummary),
    })

    const ai = createLocalizedAI({
      locale,
      temperature: 0.3,
      maxTokens: 150,
      specialInstructions:
        'Atue como consultor em mitigação de impacto de asteroides. Responda em 2–3 frases curtas e objetivas (<= 60 palavras), priorizando ações por gravidade/raio. Se faltar dado, faça 1 pergunta de esclarecimento. NUNCA use Markdown: apenas texto plano, sem asteriscos/backticks/títulos.'
    })

    const composed = `Contexto de consequências: ${contextSummary}\n\nPergunta do usuário: ${message}`
    const result = await ai.askWithHistory(composed, history)

    if (!result.success || !result.data) {
      console.error('[mitigation-chat] ai-failure', {
        traceId,
        error: result.error,
        durationMs: Date.now() - start,
        metadata: result.metadata,
      })
      return NextResponse.json({ error: result.error || 'Falha na consulta' }, { status: 500 })
    }

    const { response, updatedHistory } = result.data
    console.info('[mitigation-chat] success', {
      traceId,
      durationMs: Date.now() - start,
      replyPreview: preview(response),
      historyLen: updatedHistory.length,
      metadata: result.metadata,
    })
    return NextResponse.json({ reply: response, history: updatedHistory })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('[mitigation-chat] exception', {
      traceId,
      durationMs: Date.now() - start,
      error: msg,
    })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
