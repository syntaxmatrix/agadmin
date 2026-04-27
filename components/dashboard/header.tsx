import { LogoutButton } from "@/components/dashboard/logout-button";
import type { SessionUser } from "@/lib/types";

export function DashboardHeader({ user }: { user: SessionUser }) {
  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-4 sm:px-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Platform administration</h2>
        <p className="text-sm text-slate-500">Manage users, billing access, and outbound communication.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">{user.name ?? "Admin User"}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
