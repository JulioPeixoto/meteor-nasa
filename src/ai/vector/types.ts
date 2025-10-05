export type Severity = 'catastrophic' | 'severe' | 'moderate' | 'light'

export type ImpactConsequenceZone = {
  name: string
  severity: Severity | string
  radiusKm: number
  casualties: number
  description?: string
}

export type ImpactContext = {
  sessionId: string
  locale: 'en' | 'pt' | 'es' | 'fr' | 'zh'
  summary: string
  zones: ImpactConsequenceZone[]
  createdAt?: number
}

export type VectorQueryResult = {
  id: string
  document: string
  distance?: number
  metadata?: Record<string, unknown>
}

