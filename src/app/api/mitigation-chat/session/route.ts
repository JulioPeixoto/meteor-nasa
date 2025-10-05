export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import type { SupportedLocale } from '@/ai/interfaces'
import { createSession, summarizeConsequences, type ConsequenceZone } from '../store'

export async function POST(req: Request) {
  const traceId = Math.random().toString(36).slice(2, 10)
  try {
    const body = await req.json()
    const locale: SupportedLocale = (body?.locale || 'pt') as SupportedLocale
    const consequences: ConsequenceZone[] = body?.consequences || []

    const summary = summarizeConsequences(consequences)
    const sess = createSession(locale, summary)

    console.info('[mitigation-chat:session] created', { traceId, sessionId: sess.id, locale, zones: consequences.length })
    return NextResponse.json({ sessionId: sess.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('[mitigation-chat:session] exception', { traceId, error: msg })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

