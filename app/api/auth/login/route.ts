import { NextResponse } from "next/server";
import { getAdminEmails } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/config";

type BackendLoginResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: {
    name?: string;
    email?: string;
    role?: "User" | "Admin";
  };
  admin?: {
    name?: string;
    email?: string;
    role?: "User" | "Admin";
  };
  data?: {
    token?: string;
    accessToken?: string;
    jwt?: string;
    user?: {
      name?: string;
      email?: string;
      role?: "User" | "Admin";
    };
  };
  message?: string;
};

function pickToken(payload: BackendLoginResponse) {
  return (
    payload.token ??
    payload.accessToken ??
    payload.jwt ??
    payload.data?.token ??
    payload.data?.accessToken ??
    payload.data?.jwt
  );
}

function getCookieToken(response: Response, name: string) {
  const getSetCookie = (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const setCookieHeaders = typeof getSetCookie === "function"
    ? getSetCookie.call(response.headers)
    : [response.headers.get("set-cookie")].filter((value): value is string => Boolean(value));

  for (const header of setCookieHeaders) {
    const match = header.match(new RegExp(`${name}=([^;]+)`));
    if (match) {
      return match[1];
    }
  }

  return undefined;
}

function pickUser(payload: BackendLoginResponse) {
  return payload.user ?? payload.admin ?? payload.data?.user;
}

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string; turnstileToken?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();
  const turnstileToken = body.turnstileToken?.trim();

  if (!email || !password || !turnstileToken) {
    return NextResponse.json({ message: "Email, password, and Turnstile verification are required." }, { status: 400 });
  }

  const apiBaseUrl = API_BASE_URL;
  const loginPath = process.env.BACKEND_LOGIN_PATH || "/api/v1/user/login";

  if (!apiBaseUrl) {
    return NextResponse.json({ message: "NEXT_PUBLIC_API_BASE_URL is not configured." }, { status: 500 });
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(new URL(loginPath, apiBaseUrl).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        turnstileToken,
        "cf-turnstile-response": turnstileToken
      }),
      cache: "no-store"
    });
  } catch {
    return NextResponse.json({ message: "Could not reach the backend login service." }, { status: 502 });
  }

  let payload: BackendLoginResponse;
  try {
    payload = (await backendResponse.json()) as BackendLoginResponse;
  } catch {
    return NextResponse.json({ message: "Backend login returned an invalid response." }, { status: 502 });
  }

  if (!backendResponse.ok) {
    return NextResponse.json(
      { message: payload.message ?? "Invalid email or password." },
      { status: backendResponse.status }
    );
  }


  const user = pickUser(payload);
  const userEmail = user?.email?.trim().toLowerCase() ?? email;
  const token = pickToken(payload) ?? getCookieToken(backendResponse, "accessToken");
  const admins = getAdminEmails();

  if (!token) {
    return NextResponse.json({ message: "Backend login did not return an access token." }, { status: 502 });
  }

  if (admins.length && !admins.includes(userEmail)) {
    return NextResponse.json({ message: "Unauthorized admin email." }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  const cookieOptions = {
    httpOnly: false,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/"
  };

  response.cookies.set("admin_email", userEmail, cookieOptions);
  response.cookies.set("admin_token", token, cookieOptions);
  response.cookies.set("admin_name", user?.name?.trim() || userEmail.split("@")[0], cookieOptions);
  response.cookies.set("admin_role", "Admin", cookieOptions);

  return response;
}
