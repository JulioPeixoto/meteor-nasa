import type { SupportedLocale } from '@/ai/interfaces'

export type ConsequenceZone = {
  name: string
  severity: string
  radiusKm: number
  casualties: number
  description?: string
}

export type ChatSession = {
  id: string
  locale: SupportedLocale
  contextSummary: string
  createdAt: number
}

const sessions = new Map<string, ChatSession>()

export function createSession(locale: SupportedLocale, contextSummary: string): ChatSession {
  const id = Math.random().toString(36).slice(2, 10)
  const sess: ChatSession = { id, locale, contextSummary, createdAt: Date.now() }
  sessions.set(id, sess)
  return sess
}

export function getSession(id: string | undefined | null): ChatSession | undefined {
  if (!id) return undefined
  return sessions.get(id)
}

export function summarizeConsequences(zones: ConsequenceZone[] = []): string {
  if (!zones.length) return 'Sem dados de consequências fornecidos.'
  const items = zones
    .slice(0, 6)
    .map((z) => `${z.name} (gravidade: ${z.severity}, raio: ${z.radiusKm.toFixed(1)} km, casualidades: ${z.casualties}%)`)
    .join('; ')
  return `Zonas consideradas: ${items}. Considere gravidade e distância ao priorizar ações.`
}

