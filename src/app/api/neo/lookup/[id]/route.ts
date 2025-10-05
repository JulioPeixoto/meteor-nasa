import { NextRequest, NextResponse } from 'next/server'

const NASA_API_URL = 'https://api.nasa.gov/neo/rest/v1/neo'
const NASA_API_KEY = process.env.NASA_API_KEY!
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 note que agora é Promise
) {
  const { id } = await params // 👈 await obrigatório

  // 🔒 protege com chave interna
  const authHeader = request.headers.get('x-internal-key')
  if (authHeader !== INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const response = await fetch(`${NASA_API_URL}/${id}?api_key=${NASA_API_KEY}`)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Falha ao buscar NEO' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      status: 'success',
      neo: data,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
