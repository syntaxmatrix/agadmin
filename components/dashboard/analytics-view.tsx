"use client";

import { useEffect, useMemo, useState } from "react";
import { format, subMonths } from "date-fns";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "@/lib/api";
import { unwrapStats, unwrapUsers } from "@/lib/admin";
import type { AdminStats, AdminUser } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const PLAN_COLORS = {
  Free: "#94a3b8",
  Premium: "#3b82f6",
  Ultimate: "#10b981"
} as const;

async function fetchAllUsersForAnalytics() {
  const limit = 100;
  const firstResponse = await api.get("/users", {
    params: { page: 1, limit }
  });
  const firstPage = unwrapUsers(firstResponse.data);
  const totalPages = Math.max(1, Math.ceil(firstPage.total / limit));

  if (totalPages === 1) {
    return firstPage.users;
  }

  const responses = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      api.get("/users", {
        params: { page: index + 2, limit }
      })
    )
  );

  return responses.reduce<AdminUser[]>(
    (allUsers, response) => [...allUsers, ...unwrapUsers(response.data).users],
    firstPage.users
  );
}

export function AnalyticsView() {
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const [statsResponse, allUsers] = await Promise.all([api.get("/stats"), fetchAllUsersForAnalytics()]);
        setStats(unwrapStats(statsResponse.data));
        setUsers(allUsers);
      } catch (error) {
        toast({
          title: "Could not load analytics",
          description: error instanceof Error ? error.message : "Unknown error"
        });
      } finally {
        setLoading(false);
      }
    }

    void loadAnalytics();
  }, [toast]);

  const growthData = useMemo(() => {
    const monthStarts = Array.from({ length: 6 }, (_, index) => subMonths(new Date(), 5 - index));

    return monthStarts.map((date) => {
      const monthKey = format(date, "yyyy-MM");
      const count = users.filter((user) => format(new Date(user.createdAt), "yyyy-MM") === monthKey).length;

      return {
        month: format(date, "MMM"),
        users: count
      };
    });
  }, [users]);

  const distributionData = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      { name: "Free", value: stats.freeUsers, color: PLAN_COLORS.Free },
      { name: "Premium", value: stats.premiumUsers, color: PLAN_COLORS.Premium },
      { name: "Ultimate", value: stats.ultimateUsers, color: PLAN_COLORS.Ultimate }
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>User growth</CardTitle>
            <CardDescription>Loading database-backed growth analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[320px] w-full" />
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Subscription distribution</CardTitle>
            <CardDescription>Loading current plan mix.</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[320px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle>User growth</CardTitle>
          <CardDescription>New users created each month from the live user collection.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="users" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Subscription distribution</CardTitle>
          <CardDescription>Current plan mix across the customer base from live admin stats.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={3}>
                  {distributionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {distributionData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
