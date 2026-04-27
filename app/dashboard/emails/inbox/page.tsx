import { EmailCenterTabs } from "@/components/email/EmailCenterTabs";
import { EmailList } from "@/components/email/EmailList";

export default function InboxPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Email Center</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review inbound support traffic, inspect message contents, and download attachments.
          </p>
        </div>
        <EmailCenterTabs />
      </div>

      <EmailList />
    </section>
  );
}
