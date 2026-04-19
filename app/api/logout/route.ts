import { NextResponse } from "next/server";
import { logout } from "@/lib/auth";

export async function POST(req: Request) {
  await logout();
  const url = new URL("/login", req.url);
  return NextResponse.redirect(url, { status: 303 });
}
