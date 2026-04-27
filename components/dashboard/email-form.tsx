"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export function EmailForm() {
  const { toast } = useToast();
  const [to, setTo] = useState("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await api.post("/email/send", {
        to,
        subject,
        html: message.replace(/\n/g, "<br />")
      });

      toast({
        title: "Email queued",
        description: to === "all" ? "Broadcast email has been queued." : `Email queued for ${to}.`
      });
      setSubject("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Email failed",
        description: error instanceof Error ? error.message : "Could not send email."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Send email</CardTitle>
        <CardDescription>
          Route all outbound email through your backend so Resend credentials never touch the client.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="all or user@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your HTML-friendly message here..."
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
