export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
export const ADMIN_API_PREFIX = process.env.NEXT_PUBLIC_ADMIN_API_PREFIX ?? "/api/v1/admin";
