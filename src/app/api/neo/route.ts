// src/app/api/neo/route.ts
import { NextRequest, NextResponse } from 'next/server';

const NASA_API_URL = 'https://api.nasa.gov/neo/rest/v1/feed';
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  if (type === 'neows') {
    try {
      const today = new Date().toISOString().split('T')[0];
      const start = startDate || today;
      const end = endDate || today;

      const response = await fetch(
        `${NASA_API_URL}?start_date=${start}&end_date=${end}&api_key=${NASA_API_KEY}`
      );

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Erro ao buscar dados da NASA' },
          { status: response.status }
        );
      }

      const data = await response.json();

      return NextResponse.json({
        status: 'success',
        start_date: start,
        end_date: end,
        objects: data.near_earth_objects,
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Falha interna', details: error.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    message: 'NEO API endpoint',
    usage: 'Use /api/neo?type=neows&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD',
  });
}
