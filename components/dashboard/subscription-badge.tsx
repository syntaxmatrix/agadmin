import { Badge } from "@/components/ui/badge";
import type { SubscriptionPlan } from "@/lib/types";

const styles: Record<SubscriptionPlan, string> = {
  Free: "bg-[#e2fdff]",
  Premium: "bg-[#3772ff]",
  Ultimate: "bg-[#e23c47]"
};

export function SubscriptionBadge({ plan }: { plan: SubscriptionPlan }) {
  return <Badge className={styles[plan]}>{plan}</Badge>;
}
