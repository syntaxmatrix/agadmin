"use client";

import { useEffect, useState } from "react";
import { Download, Paperclip } from "lucide-react";
import { downloadInboxAttachment, fetchInboxEmailById, sanitizeHtml } from "@/lib/email";
import type { InboxEmailDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

export function EmailDetailDialog({
  emailId,
  open,
  onClose
}: {
  emailId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [detail, setDetail] = useState<InboxEmailDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !emailId) {
      return;
    }

    const targetEmailId = emailId;

    async function loadDetail() {
      setLoading(true);
      try {
        setDetail(await fetchInboxEmailById(targetEmailId));
      } catch (error) {
        toast({
          title: "Could not load email",
          description: error instanceof Error ? error.message : "Unknown error"
        });
      } finally {
        setLoading(false);
      }
    }

    void loadDetail();
  }, [emailId, open, toast]);

  async function handleAttachmentDownload(attachmentId: string) {
    if (!detail) {
      return;
    }

    const attachment = detail.attachments.find((item) => item.id === attachmentId);
    if (!attachment) {
      return;
    }

    setDownloadingId(attachmentId);
    try {
      await downloadInboxAttachment(detail.id, attachment);
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Could not download attachment."
      });
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{detail?.subject ?? "Email details"}</DialogTitle>
          <DialogDescription>Review message content, metadata, and attachments.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : detail ? (
          <div className="space-y-6">
            <div className="grid gap-3 rounded-md border bg-slate-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">From</p>
                <p className="mt-1 font-medium text-slate-900">{detail.from}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">To</p>
                <p className="mt-1 font-medium text-slate-900">{detail.to?.join(", ") || "Not available"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Date</p>
                <p className="mt-1 font-medium text-slate-900">{new Date(detail.receivedAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                <p className="mt-1 font-medium capitalize text-slate-900">{detail.status}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">Body</p>
              {detail.html ? (
                <div
                  className="prose prose-slate max-w-none rounded-md border bg-white p-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(detail.html) }}
                />
              ) : (
                <div className="whitespace-pre-wrap rounded-md border bg-white p-4 text-sm text-slate-700">
                  {detail.text || "No message body was provided."}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-medium text-slate-900">Attachments</p>
              </div>
              {detail.attachments.length ? (
                <div className="space-y-2">
                  {detail.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between rounded-md border px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{attachment.name}</p>
                        <p className="text-slate-500">
                          {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : "Size unavailable"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleAttachmentDownload(attachment.id)}
                        disabled={downloadingId === attachment.id}
                      >
                        <Download className="h-4 w-4" />
                        {downloadingId === attachment.id ? "Downloading..." : "Download"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed px-4 py-6 text-sm text-slate-500">
                  No attachments on this email.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed px-4 py-8 text-sm text-slate-500">
            Select an email to inspect its details.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
