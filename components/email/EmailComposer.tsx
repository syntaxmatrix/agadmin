"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Eye, Send } from "lucide-react";
import { emailSupport, emailUpdates } from "@/constant";
import { sendAdminEmail } from "@/lib/email";
import type { EmailBodyType, EmailSenderType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { EmailPreview } from "@/components/email/EmailPreview";
import { cn } from "@/lib/utils";

const bodyModes: Array<{ value: EmailBodyType; label: string }> = [
  { value: "text", label: "Plain Text" },
  { value: "html", label: "HTML" }
];

const senderModes: Array<{ value: EmailSenderType; label: string; email: string; hint: string }> = [
  {
    value: "support",
    label: "Support",
    email: emailSupport,
    hint: "Use for replies, help, and customer-facing support messages."
  },
  {
    value: "updates",
    label: "Updates",
    email: emailUpdates,
    hint: "Use for product news, releases, and broadcast announcements."
  }
];

export function EmailComposer() {
  const { toast } = useToast();
  const [recipient, setRecipient] = useState("");
  const [broadcast, setBroadcast] = useState(false);
  const [subject, setSubject] = useState("");
  const [senderType, setSenderType] = useState<EmailSenderType>("support");
  const [bodyType, setBodyType] = useState<EmailBodyType>("text");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const resolvedRecipient = useMemo(() => (broadcast ? "all" : recipient.trim()), [broadcast, recipient]);
  const activeSender = senderModes.find((mode) => mode.value === senderType) ?? senderModes[0];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);

    try {
      await sendAdminEmail({
        to: resolvedRecipient as string | "all",
        subject,
        bodyType,
        content,
        senderType
      });

      toast({
        title: "Email sent",
        description: broadcast
          ? `${activeSender.label} broadcast email has been queued.`
          : `Email sent from ${activeSender.email} to ${recipient}.`
      });
      setRecipient("");
      setBroadcast(false);
      setSubject("");
      setSenderType("support");
      setBodyType("text");
      setContent("");
      setShowPreview(false);
    } catch (error) {
      toast({
        title: "Email failed",
        description: error instanceof Error ? error.message : "Could not send the email."
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Email composer</CardTitle>
          <CardDescription>Send a targeted email or a full-user broadcast from the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <Label>From</Label>
              <div className="inline-flex rounded-md border bg-white p-1">
                {senderModes.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    className={cn(
                      "rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                      senderType === mode.value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    )}
                    onClick={() => setSenderType(mode.value)}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              <div className="rounded-md border bg-slate-50 px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{activeSender.email}</p>
                <p className="mt-1 text-xs text-slate-500">{activeSender.hint}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 rounded-md border bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">Broadcast to all users</p>
                  <p className="text-xs text-slate-500">Disable the recipient field and send to the full audience.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={broadcast}
                    onChange={(event) => setBroadcast(event.target.checked)}
                  />
                </label>
              </div>
              {broadcast ? (
                <Badge className="gap-1 bg-amber-100 text-amber-800">
                  <AlertTriangle className="h-3 w-3" />
                  This will send to all users
                </Badge>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                type="email"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                placeholder="user@example.com"
                disabled={broadcast}
                required={!broadcast}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Product update"
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Body Type</Label>
              <div className="inline-flex rounded-md border bg-white p-1">
                {bodyModes.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    className={cn(
                      "rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                      bodyType === mode.value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    )}
                    onClick={() => setBodyType(mode.value)}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">{bodyType === "html" ? "HTML Body" : "Plain Text Body"}</Label>
              <Textarea
                id="content"
                className={cn("min-h-[240px]", bodyType === "html" && "font-mono text-xs")}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={
                  bodyType === "html"
                    ? "<h1>Hello</h1><p>Write your email markup here.</p>"
                    : "Write your message here..."
                }
                required
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" disabled={sending} className="gap-2">
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send"}
              </Button>
              <Button type="button" variant="outline" className="gap-2" onClick={() => setShowPreview((current) => !current)}>
                <Eye className="h-4 w-4" />
                {showPreview ? "Hide Preview" : "Preview"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className={cn("xl:block", showPreview ? "block" : "hidden xl:block")}>
        <EmailPreview bodyType={bodyType} content={content} />
      </div>
    </div>
  );
}
