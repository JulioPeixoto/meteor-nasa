export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import type { ChatMessage, SupportedLocale } from '@/ai/interfaces'
import { getSession, summarizeConsequences } from '../store'
import { createSystemPrompt } from '@/ai/prompts'

type ConsequenceZone = {
  name: string
  severity: string
  radiusKm: number
  casualties: number
  description?: string
}

export async function POST(req: Request) {
  const start = Date.now()
  const traceId = Math.random().toString(36).slice(2, 10)

  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('[mitigation-chat:stream] missing-api-key', { traceId })
      return NextResponse.json({ error: 'Serviço de IA não configurado' }, { status: 503 })
    }

    const body = await req.json()
    const message: string = body?.message || ''
    const history: ChatMessage[] = body?.history || []
    const consequences: ConsequenceZone[] = body?.consequences || []
    const sessionId: string | undefined = body?.sessionId
    const locale: SupportedLocale = (body?.locale || 'pt') as SupportedLocale

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Mensagem inválida' }, { status: 400 })
    }

    const session = getSession(sessionId)
    const summary = session?.contextSummary ?? summarizeConsequences(consequences)

    // System prompt: curto, interativo, com follow-up question
    const baseSystem = createSystemPrompt(locale, {
      appContext: 'Meteor Madness — análise de impacto e mitigação',
      specialInstructions: [
        'Seja CONCISO (<= 60 palavras).',
        'Use 2–3 frases curtas e claras (texto contínuo).',
        'Faça no máximo 1 pergunta objetiva ao final, apenas se necessário.',
        'Sem saudações/meta; vá direto às ações priorizadas por severidade/raio.',
        'NUNCA use Markdown. Apenas texto plano: sem asteriscos/backticks/títulos/negrito/itálico.'
      ].join(' ')
    })

    const messages: ChatMessage[] = [
      { role: 'system', content: baseSystem },
      { role: 'user', content: `Contexto de consequências: ${summary}` },
      ...history,
      { role: 'user', content: message }
    ]

    console.info('[mitigation-chat:stream] start', {
      traceId,
      locale,
      historyLen: history.length,
      zones: (session?.contextSummary ? 'session' : consequences.length),
      sessionId: session?.id,
      messagePreview: message.slice(0, 80)
    })

    const dsRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        stream: true,
        temperature: 0.3,
        max_tokens: 120,
        messages
      })
    })

    if (!dsRes.ok || !dsRes.body) {
      const txt = await dsRes.text().catch(() => '')
      console.error('[mitigation-chat:stream] deepseek-failed', { traceId, status: dsRes.status, bodyPreview: txt.slice(0, 200) })
      return NextResponse.json({ error: 'Falha ao conectar IA' }, { status: 502 })
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const sanitize = (s: string) => s.replace(/[`*]/g, '')
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode(`event: start\n` + `data: {"traceId":"${traceId}"}\n\n`))
          const reader = dsRes.body!.getReader()
          let buffer = ''
          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })

            const parts = buffer.split('\n\n')
            buffer = parts.pop() || ''
            for (const part of parts) {
              const lines = part.split('\n')
              for (const line of lines) {
                if (!line.startsWith('data:')) continue
                const data = line.slice(5).trim()
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode(`event: done\n` + `data: [DONE]\n\n`))
                  controller.close()
                  console.info('[mitigation-chat:stream] done', { traceId, durationMs: Date.now() - start })
                  return
                }
                try {
                  const json = JSON.parse(data)
                  let token = json?.choices?.[0]?.delta?.content
                  // Em stream, só consome deltas; ignore snapshots completos para evitar duplicação
                  if (typeof token === 'string' && token.length > 0) {
                    token = sanitize(token)
                    if (token.length > 0) {
                      controller.enqueue(encoder.encode(`event: token\n` + `data: ${JSON.stringify(token)}\n\n`))
                    }
                  }
                } catch {
                  // Non-JSON payload; ignore
                }
              }
            }
          }
          controller.enqueue(encoder.encode(`event: done\n` + `data: [DONE]\n\n`))
          controller.close()
          console.info('[mitigation-chat:stream] complete-no-done', { traceId, durationMs: Date.now() - start })
        } catch (e) {
          console.error('[mitigation-chat:stream] stream-error', { traceId, error: e instanceof Error ? e.message : String(e) })
          try { controller.error(e) } catch {}
        }
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      }
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('[mitigation-chat:stream] exception', { traceId, durationMs: Date.now() - start, error: msg })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
