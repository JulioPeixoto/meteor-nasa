import { embedTexts } from './embeddings'
import type { ImpactContext, VectorQueryResult } from './types'
import { memoryUpsert, memoryQuery, memoryClear } from './memory-store'

function docId(parts: (string | number)[]): string {
  return parts.join(':')
}

export async function upsertImpactContext(ctx: ImpactContext): Promise<{ count: number }> {
  const docs: { id: string; document: string; metadata?: Record<string, unknown> }[] = []

  // summary
  docs.push({ id: docId([ctx.sessionId, 'summary']), document: ctx.summary, metadata: { type: 'summary', locale: ctx.locale, createdAt: ctx.createdAt || Date.now() } })
  // zones
  ctx.zones.forEach((z, i) => {
    const text = `${z.name}. Severidade: ${z.severity}. Raio: ${Math.round(z.radiusKm)} km. Casualidades: ${z.casualties}%. ${z.description || ''}`
    docs.push({ id: docId([ctx.sessionId, 'zone', i]), document: text, metadata: { type: 'zone', index: i, name: z.name, severity: z.severity, radiusKm: z.radiusKm, casualties: z.casualties } })
  })

  const vectors = await embedTexts(docs.map((d) => d.document))
  const entries = docs.map((d, i) => ({ id: d.id, document: d.document, metadata: d.metadata, embedding: vectors[i] }))
  const { count } = memoryUpsert(ctx.sessionId, entries)
  return { count }
}

export async function queryImpactContext(sessionId: string, query: string, topK = 5): Promise<VectorQueryResult[]> {
  const [q] = await embedTexts([query])
  return memoryQuery(sessionId, q, topK)
}

export async function clearImpactContext(sessionId: string): Promise<void> {
  memoryClear(sessionId)
}

export async function buildSystemContextFromVectors(sessionId: string, locale: ImpactContext['locale'], question: string): Promise<string> {
  const hits = await queryImpactContext(sessionId, question, 4)
  if (!hits.length) return ''
  const lines = hits.map((h) => `- ${h.document}`)
  if (locale === 'pt') return `Contexto recuperado:\n${lines.join('\n')}`
  if (locale === 'es') return `Contexto recuperado:\n${lines.join('\n')}`
  if (locale === 'fr') return `Contexte récupéré:\n${lines.join('\n')}`
  if (locale === 'zh') return `检索到的上下文:\n${lines.join('\n')}`
  return `Retrieved context:\n${lines.join('\n')}`
}

export * from './types'
