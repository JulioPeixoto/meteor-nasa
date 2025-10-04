import { NextRequest, NextResponse } from 'next/server'

const NASA_API_URL = 'https://api.nasa.gov/neo/rest/v1/feed'
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY'

export async function GET(
  request: NextRequest,
  { params }: { params: { flag: string } }
) {
  const { flag } = params
  const filterFlag = flag === 'true'

  try {
    const today = new Date().toISOString().split('T')[0]

    const response = await fetch(
      `${NASA_API_URL}?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar feed' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const filtered: Record<string, any[]> = {}

    for (const date in data.near_earth_objects) {
      filtered[date] = data.near_earth_objects[date].filter(
        (obj: any) => obj.is_sentry_object === filterFlag
      )
    }

    for (const date in filtered) {
      if (filtered[date].length === 0) delete filtered[date]
    }

    return NextResponse.json({
      status: 'success',
      filter: filterFlag,
      objects: filtered,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
