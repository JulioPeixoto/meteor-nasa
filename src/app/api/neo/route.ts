import { NextRequest, NextResponse } from 'next/server';

const NASA_API_URL = 'https://api.nasa.gov/neo/rest/v1/feed';
const NASA_API_KEY = process.env.NASA_API_KEY!;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY!;

// 🧠 Mapa para limitar requisições
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit = 20, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) return { allowed: false, remaining: 0 };

  entry.count++;
  rateLimitMap.set(ip, entry);
  return { allowed: true, remaining: limit - entry.count };
}

// 🧱 Handler principal
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const authHeader = req.headers.get('x-internal-key');

  // 🚫 Bloqueia se não tiver a chave interna correta
  if (authHeader !== INTERNAL_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized access to internal API' },
      { status: 401 }
    );
  }

  // 🔒 Rate limit opcional
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // 🔭 Chama a API da NASA
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'Missing start_date or end_date' },
      { status: 400 }
    );
  }

  try {
    const nasaRes = await fetch(
      `${NASA_API_URL}?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`
    );

    if (!nasaRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch data from NASA' },
        { status: nasaRes.status }
      );
    }

    const data = await nasaRes.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: (err as Error).message },
      { status: 500 }
    );
  }
}
