import { NextRequest, NextResponse } from 'next/server'

const NASA_API_URL = 'https://api.nasa.gov/neo/rest/v1/neo'
const NASA_API_KEY = process.env.NASA_API_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 ainda é Promise
) {
  const { id } = await params // 👈 precisa do await no Next.js 15+

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
    return NextResponse.json(
      { error: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}
