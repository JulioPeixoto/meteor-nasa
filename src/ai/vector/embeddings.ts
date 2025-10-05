type EmbedOptions = {
  apiKey?: string
  baseUrl?: string
  model?: string
}

const DEFAULT_MODEL = 'text-embedding-3-small'

export async function embedTexts(texts: string[], opts: EmbedOptions = {}): Promise<number[][]> {
  const apiKey = opts.apiKey || process.env.OPENAI_API_KEY
  const baseUrl = opts.baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const model = opts.model || process.env.OPENAI_EMBED_MODEL || DEFAULT_MODEL

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY é obrigatório para gerar embeddings')
  }

  const res = await fetch(`${baseUrl}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, input: texts }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Embeddings API falhou (${res.status}): ${body.slice(0, 200)}`)
  }

  const data = await res.json()
  const vectors = (data?.data || []).map((d: any) => d.embedding as number[])
  if (!Array.isArray(vectors) || vectors.length !== texts.length) {
    throw new Error('Embeddings API retornou payload inválido')
  }
  return vectors
}
