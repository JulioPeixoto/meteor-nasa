import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 precisa ser Promise
) {
  const { id } = await params; // 👈 precisa do await aqui

  if (!id) {
    return NextResponse.json({ error: "Missing asteroid ID" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/neo/lookup/${id}`,
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_API_KEY!,
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to fetch asteroid details from internal API",
        details: (err as Error).message,
      },
      { status: 500 }
    );
  }
}
