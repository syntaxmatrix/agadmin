import { AnalyticsView } from "@/components/dashboard/analytics-view";

export default function AnalyticsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor growth trends and subscription distribution from one place.
        </p>
      </div>
      <AnalyticsView />
    </section>
  );
}
