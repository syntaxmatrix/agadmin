"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function LogoutButton() {
  const router = useRouter();
  const { toast } = useToast();

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) {
      toast({ title: "Logout failed", description: "Please try again." });
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
