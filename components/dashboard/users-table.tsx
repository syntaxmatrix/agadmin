"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Search, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { unwrapUsers } from "@/lib/admin";
import type { AdminUser, SubscriptionPlan } from "@/lib/types";
import { SubscriptionModal } from "@/components/dashboard/subscription-modal";
import { SubscriptionBadge } from "@/components/dashboard/subscription-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

const PAGE_SIZE = 8;

export function UsersTable() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await api.get("/users");
        const normalized = unwrapUsers(response.data);
        setUsers(normalized.users);
      } catch (error) {
        toast({
          title: "Could not load users",
          description: error instanceof Error ? error.message : "Unknown error"
        });
      } finally {
        setLoading(false);
      }
    }

    void fetchUsers();
  }, [toast]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return users;
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.subscription.toLowerCase().includes(term)
    );
  }, [search, users]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  async function handleDelete(user: AdminUser) {
    if (!window.confirm(`Delete ${user.email}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/users/${user.id}`);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      toast({ title: "User deleted", description: `${user.email} has been removed.` });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Could not delete user."
      });
    }
  }

  async function handleSubscriptionSave(payload: { plan: SubscriptionPlan; expiry: string }) {
    if (!selectedUser) {
      return;
    }

    try {
      await api.patch(`/users/${selectedUser.id}/subscription`, payload);
      setUsers((current) =>
        current.map((item) =>
          item.id === selectedUser.id ? { ...item, subscription: payload.plan, expiry: payload.expiry } : item
        )
      );
      toast({
        title: "Subscription updated",
        description: `${selectedUser.email} is now on ${payload.plan}.`
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update subscription."
      });
      throw error;
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>User management</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search name, email, or plan"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length ? (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <SubscriptionBadge plan={user.subscription} />
                    </TableCell>
                    <TableCell>{user.expiry ? format(new Date(user.expiry), "MMM d, yyyy") : "N/A"}</TableCell>
                    <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                          Manage
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                    No users matched your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {filteredUsers.length
                ? `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, filteredUsers.length)} of ${filteredUsers.length}`
                : "Showing 0 results"}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === pageCount}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SubscriptionModal
        open={Boolean(selectedUser)}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onSave={handleSubscriptionSave}
      />
    </>
  );
}
