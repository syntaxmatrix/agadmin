import { EmailComposer } from "@/components/email/EmailComposer";
import { EmailCenterTabs } from "@/components/email/EmailCenterTabs";

export default function EmailsPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Email Center</h1>
          <p className="mt-1 text-sm text-slate-500">
            Compose outbound email, preview content, and manage communications from one place.
          </p>
        </div>
        <EmailCenterTabs />
      </div>

      <EmailComposer />
    </section>
  );
}
