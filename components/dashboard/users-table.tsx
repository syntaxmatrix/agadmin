"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Download, Search, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { unwrapUsers } from "@/lib/admin";
import type { AdminUser, SubscriptionPlan } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
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

const PAGE_SIZE = 10;
const IST_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true
});

export function UsersTable() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const response = await api.get("/users", {
          params: {
            page,
            limit: PAGE_SIZE,
            ...(debouncedSearch ? { q: debouncedSearch } : {})
          }
        });
        const normalized = unwrapUsers(response.data);
        setUsers(normalized.users);
        setTotalUsers(normalized.total);
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
  }, [debouncedSearch, page, toast]);

  const pageCount = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  async function handleDelete(user: AdminUser) {
    if (!window.confirm(`Delete ${user.email}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/users/${user.id}`);
      const nextPage = users.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      if (nextPage === page) {
        setUsers((current) => current.filter((item) => item.id !== user.id));
        setTotalUsers((current) => Math.max(current - 1, 0));
      }
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

  async function handleCsvDownload() {
    setDownloadingCsv(true);

    try {
      const response = await api.get("/users/emails/csv", {
        responseType: "blob"
      });
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "users-emails.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "CSV export failed",
        description: error instanceof Error ? error.message : "Could not download user emails."
      });
    } finally {
      setDownloadingCsv(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>User management</CardTitle>
          <div className="flex w-full flex-col gap-3 sm:max-w-xl sm:flex-row sm:items-center sm:justify-end">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2" onClick={handleCsvDownload} disabled={downloadingCsv}>
              <Download className="h-4 w-4" />
              {downloadingCsv ? "Downloading..." : "Download CSV"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={user.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                        {user.isVerified ? "True" : "False"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <SubscriptionBadge plan={user.subscription} />
                    </TableCell>
                    <TableCell>{user.expiry ? format(new Date(user.expiry), "MMM d, yyyy") : "N/A"}</TableCell>
                    <TableCell>{IST_DATE_TIME_FORMATTER.format(new Date(user.createdAt))}</TableCell>
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
                  <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                    No users matched your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {totalUsers
                ? `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, totalUsers)} of ${totalUsers}`
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
