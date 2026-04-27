"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { unwrapStats } from "@/lib/admin";
import type { AdminStats } from "@/lib/types";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LoadingState } from "@/components/dashboard/loading-state";
import { MetricCard } from "@/components/dashboard/metric-card";

export function DashboardOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get("/stats");
        setStats(unwrapStats(response.data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load admin stats.");
      } finally {
        setLoading(false);
      }
    }

    void fetchStats();
  }, []);

  if (loading) {
    return <LoadingState label="Loading platform metrics..." />;
  }

  if (error) {
    return <EmptyState title="Could not load metrics" description={error} />;
  }

  if (!stats) {
    return <EmptyState title="No metrics available" description="The backend returned an empty stats payload." />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <MetricCard label="Total Users" value={stats.totalUsers} />
      <MetricCard label="Free Users" value={stats.freeUsers} />
      <MetricCard label="Premium Users" value={stats.premiumUsers} />
      <MetricCard label="Ultimate Users" value={stats.ultimateUsers} />
      <MetricCard label="New Users Today" value={stats.newUsersToday} />
    </div>
  );
}
