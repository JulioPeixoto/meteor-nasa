import { NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { getUserByEmailStrict } from "@/queries/auth.queries";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") ?? session.user.email;

  if (email !== session.user.email) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const user = await getUserByEmailStrict(email);
  if (!user) return NextResponse.json(null);

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    cellphone: user.cellphone ?? null,
    taxId: user.taxId ?? null,
  });
}
