import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import type { Session } from "next-auth";

export async function requireSession(): Promise<Session> {
  const session = await getServerSession();
  if (!session?.user) {
    throw new NextResponse("Unauthorized", { status: 401 });
  }
  return session;
}
