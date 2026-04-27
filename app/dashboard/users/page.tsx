import { UsersTable } from "@/components/dashboard/users-table";

export default function UsersPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review accounts, adjust subscription access, and remove users when needed.
        </p>
      </div>
      <UsersTable />
    </section>
  );
}
