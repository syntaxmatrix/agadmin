"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fetchInboxEmails } from "@/lib/email";
import type { InboxEmailSummary } from "@/lib/types";
import { EmailDetailDialog } from "@/components/email/EmailDetailDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

export function EmailList() {
  const { toast } = useToast();
  const [emails, setEmails] = useState<InboxEmailSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmails() {
      try {
        setEmails(await fetchInboxEmails());
      } catch (error) {
        toast({
          title: "Could not load inbox",
          description: error instanceof Error ? error.message : "Unknown error"
        });
      } finally {
        setLoading(false);
      }
    }

    void loadEmails();
  }, [toast]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Support inbox</CardTitle>
          <CardDescription>Incoming support and reply traffic received through your backend email stack.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : emails.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((email) => (
                  <TableRow key={email.id} className="cursor-pointer" onClick={() => setSelectedEmailId(email.id)}>
                    <TableCell className="font-medium">{email.from}</TableCell>
                    <TableCell>{email.subject}</TableCell>
                    <TableCell>{format(new Date(email.receivedAt), "MMM d, yyyy h:mm a")}</TableCell>
                    <TableCell className="capitalize">{email.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-md border border-dashed px-4 py-12 text-center text-sm text-slate-500">
              No inbound support emails yet.
            </div>
          )}
        </CardContent>
      </Card>

      <EmailDetailDialog emailId={selectedEmailId} open={Boolean(selectedEmailId)} onClose={() => setSelectedEmailId(null)} />
    </>
  );
}
