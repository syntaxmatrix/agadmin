import type { AdminStats, AdminUser } from "@/lib/types";

type ApiEnvelope<T> = {
  statusCode?: number;
  data?: T;
  message?: string;
  success?: boolean;
};

type BackendAdminUser = {
  _id: string;
  name?: string;
  email: string;
  subscription: AdminUser["subscription"];
  subscriptionExpiry?: string | null;
  createdAt: string;
};

type UsersPayload = {
  users?: BackendAdminUser[];
  total?: number;
  page?: number;
};

export function unwrapStats(payload: ApiEnvelope<AdminStats> | AdminStats): AdminStats {
  const stats: Partial<AdminStats> =
    "data" in payload
      ? ((payload as ApiEnvelope<AdminStats>).data ?? {})
      : (payload as AdminStats);

  return {
    totalUsers: stats?.totalUsers ?? 0,
    freeUsers: stats?.freeUsers ?? 0,
    premiumUsers: stats?.premiumUsers ?? 0,
    ultimateUsers: stats?.ultimateUsers ?? 0,
    newUsersToday: stats?.newUsersToday ?? 0
  };
}

export function unwrapUsers(
  payload: ApiEnvelope<UsersPayload> | AdminUser[]
): { users: AdminUser[]; total: number; page: number } {
  if (Array.isArray(payload)) {
    return {
      users: payload,
      total: payload.length,
      page: 1
    };
  }

  const users = payload.data?.users ?? [];

  return {
    users: users.map((user) => ({
      id: user._id,
      name: user.name ?? "Unknown",
      email: user.email,
      subscription: user.subscription,
      expiry: user.subscriptionExpiry ?? null,
      createdAt: user.createdAt
    })),
    total: payload.data?.total ?? users.length,
    page: payload.data?.page ?? 1
  };
}
