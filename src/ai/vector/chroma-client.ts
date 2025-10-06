type ChromaCollection = {
  id: string
  name: string
  metadata?: Record<string, unknown>
}

type AddRequest = {
  ids: string[]
  documents?: string[]
  metadatas?: Record<string, unknown>[]
  embeddings?: number[][]
}

type QueryRequest = {
  query_embeddings: number[][]
  n_results?: number
  where?: Record<string, unknown>
  where_document?: Record<string, unknown>
}

type QueryResponse = {
  ids: string[][]
  documents: string[][]
  distances?: number[][]
  metadatas?: Record<string, unknown>[][]
}

export class ChromaHttpClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:8000').replace(/\/$/, '')
  }

  private async json<T>(res: Response): Promise<T> {
    const text = await res.text()
    try { return JSON.parse(text) as T } catch { throw new Error(`Chroma: invalid JSON (${res.status})`) }
  }

  async getCollectionByName(name: string): Promise<ChromaCollection | null> {
    const url = `${this.baseUrl}/api/v1/collections/by_name?name=${encodeURIComponent(name)}`
    const res = await fetch(url)
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`Chroma: getCollectionByName failed ${res.status}`)
    return this.json<ChromaCollection>(res)
  }

  async createCollection(name: string, metadata?: Record<string, unknown>): Promise<ChromaCollection> {
    const res = await fetch(`${this.baseUrl}/api/v1/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, metadata }),
    })
    if (!res.ok) throw new Error(`Chroma: createCollection failed ${res.status}`)
    return this.json<ChromaCollection>(res)
  }

  async ensureCollection(name: string, metadata?: Record<string, unknown>): Promise<ChromaCollection> {
    const got = await this.getCollectionByName(name)
    if (got) return got
    return this.createCollection(name, metadata)
  }

  async add(collectionId: string, data: AddRequest): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/v1/collections/${collectionId}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Chroma: add failed ${res.status}`)
  }

  async query(collectionId: string, q: QueryRequest): Promise<QueryResponse> {
    const res = await fetch(`${this.baseUrl}/api/v1/collections/${collectionId}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(q),
    })
    if (!res.ok) throw new Error(`Chroma: query failed ${res.status}`)
    return this.json<QueryResponse>(res)
  }

  async deleteWhere(collectionId: string, where: Record<string, unknown>): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/v1/collections/${collectionId}/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ where }),
    })
    if (!res.ok) throw new Error(`Chroma: deleteWhere failed ${res.status}`)
  }
}

