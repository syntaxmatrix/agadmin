import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  ["admin_email", "admin_token", "admin_name", "admin_role"].forEach((name) =>
    response.cookies.set(name, "", { expires: new Date(0), path: "/" })
  );
  return response;
}
