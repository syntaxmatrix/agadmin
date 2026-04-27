import { Badge } from "@/components/ui/badge";
import type { SubscriptionPlan } from "@/lib/types";

const styles: Record<SubscriptionPlan, string> = {
  Free: "bg-slate-100 text-slate-700",
  Premium: "bg-blue-100 text-blue-700",
  Ultimate: "bg-emerald-100 text-emerald-700"
};

export function SubscriptionBadge({ plan }: { plan: SubscriptionPlan }) {
  return <Badge className={styles[plan]}>{plan}</Badge>;
}
