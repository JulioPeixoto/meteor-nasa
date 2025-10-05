// app/api/proxy/neo/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const start = url.searchParams.get("start_date");
  const end = url.searchParams.get("end_date");
  const minDiameter = url.searchParams.get("min_diameter");
  const minVelocity = url.searchParams.get("min_velocity");

  if (!start || !end) {
    return NextResponse.json({ error: "Missing date range" }, { status: 400 });
  }

  try {
    // 🔒 Faz chamada interna segura
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/neo?start_date=${start}&end_date=${end}`,
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_API_KEY!, // nunca exposta
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch from internal API", details: (err as Error).message },
      { status: 500 }
    );
  }
}
