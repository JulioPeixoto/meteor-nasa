export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import type { SupportedLocale } from '@/ai/interfaces'
import { createSession, summarizeConsequences, keyFactsFromConsequences, type ConsequenceZone } from '../store'
import { upsertImpactContext } from '@/ai/vector'

export async function POST(req: Request) {
  const traceId = Math.random().toString(36).slice(2, 10)
  try {
    const body = await req.json()
    const locale: SupportedLocale = (body?.locale || 'pt') as SupportedLocale
    const consequences: ConsequenceZone[] = body?.consequences || []

    const summary = summarizeConsequences(consequences)
    const facts = keyFactsFromConsequences(consequences)
    const sess = createSession(locale, summary, facts)

    // Persist in Chroma (best-effort). Do not fail session creation if it errors.
    try {
      await upsertImpactContext({
        sessionId: sess.id,
        locale,
        summary,
        zones: consequences,
        createdAt: Date.now(),
      })
    } catch (e) {
      console.warn('[mitigation-chat:session] vector-upsert-failed', { sessionId: sess.id, error: e instanceof Error ? e.message : String(e) })
    }

    console.info('[mitigation-chat:session] created', { traceId, sessionId: sess.id, locale, zones: consequences.length })
    return NextResponse.json({ sessionId: sess.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('[mitigation-chat:session] exception', { traceId, error: msg })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
