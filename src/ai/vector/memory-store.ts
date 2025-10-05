import type { VectorQueryResult } from './types'

type StoredVec = {
  id: string
  embedding: number[]
  document: string
  metadata?: Record<string, unknown>
}

// sessionId -> vectors
const DB = new Map<string, StoredVec[]>()

export function memoryUpsert(
  sessionId: string,
  entries: { id: string; document: string; embedding: number[]; metadata?: Record<string, unknown> }[]
): { count: number } {
  const arr = DB.get(sessionId) || []
  // replace if same id exists
  const map = new Map<string, StoredVec>(arr.map((e) => [e.id, e]))
  for (const e of entries) {
    map.set(e.id, { id: e.id, document: e.document, embedding: e.embedding, metadata: e.metadata })
  }
  const next = Array.from(map.values())
  DB.set(sessionId, next)
  return { count: next.length }
}

export function memoryQuery(sessionId: string, queryEmbedding: number[], topK = 5): VectorQueryResult[] {
  const arr = DB.get(sessionId) || []
  if (!arr.length) return []
  const q = normalize(queryEmbedding)
  const scored = arr.map((e) => ({
    e,
    score: dot(q, normalize(e.embedding)),
  }))
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK).map(({ e, score }) => ({ id: e.id, document: e.document, distance: 1 - score, metadata: e.metadata }))
}

export function memoryClear(sessionId: string): void {
  DB.delete(sessionId)
}

function dot(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length)
  let s = 0
  for (let i = 0; i < n; i++) s += a[i] * b[i]
  return s
}

function normalize(v: number[]): number[] {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0) || 1)
  return v.map((x) => x / n)
}

