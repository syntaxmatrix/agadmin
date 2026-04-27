import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <Suspense fallback={<div className="text-sm text-slate-500">Loading sign-in...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
