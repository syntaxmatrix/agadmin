import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SessionUser } from "@/lib/types";

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const email = cookieStore.get("admin_email")?.value;
  const token = cookieStore.get("admin_token")?.value;
  const name = cookieStore.get("admin_name")?.value;
  const role = cookieStore.get("admin_role")?.value as SessionUser["role"] | undefined;

  if (!email || !token || !role) {
    return null;
  }

  return { email, token, name, role };
}

export async function requireAdmin() {
  const session = await getSessionUser();
  const admins = getAdminEmails();
  const emailIsAllowed = !admins.length || admins.includes(session?.email.toLowerCase() ?? "");

  if (!session || session.role !== "Admin" || !emailIsAllowed) {
    redirect("/login");
  }

  return session;
}
