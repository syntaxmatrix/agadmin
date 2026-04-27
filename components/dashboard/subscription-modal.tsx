"use client";

import { useEffect, useState } from "react";
import type { AdminUser, SubscriptionPlan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSave: (payload: { plan: SubscriptionPlan; expiry: string }) => Promise<void>;
};

export function SubscriptionModal({ open, user, onClose, onSave }: Props) {
  const [plan, setPlan] = useState<SubscriptionPlan>("Free");
  const [expiry, setExpiry] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setPlan(user.subscription);
    setExpiry(user.expiry ? user.expiry.slice(0, 10) : "");
  }, [user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({
        plan,
        expiry: expiry ? new Date(expiry).toISOString() : new Date().toISOString()
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update subscription</DialogTitle>
          <DialogDescription>
            Change the active plan and expiry for {user?.email ?? "this user"}.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Plan</Label>
            <Select value={plan} onValueChange={(value) => setPlan(value as SubscriptionPlan)}>
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Ultimate">Ultimate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry date</Label>
            <Input id="expiry" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
