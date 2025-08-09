import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("auth-token", "", {
    httpOnly: true,
    secure: true, // Essential for HTTPS
    path: "/",
    sameSite: "none", // Important for security in modern browsers
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}
