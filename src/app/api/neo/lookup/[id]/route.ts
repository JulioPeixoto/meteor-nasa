import { NextRequest, NextResponse } from 'next/server'

const NASA_API_URL = 'https://api.nasa.gov/neo/rest/v1/neo'
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

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
