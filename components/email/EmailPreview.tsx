"use client";

import type { EmailBodyType } from "@/lib/types";
import { sanitizeHtml } from "@/lib/email";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function EmailPreview({
  bodyType,
  content
}: {
  bodyType: EmailBodyType;
  content: string;
}) {
  const hasContent = content.trim().length > 0;

  return (
    <Card className="h-full min-h-[420px]">
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>Review how the message will look before sending.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasContent ? (
          bodyType === "html" ? (
            <div
              className="prose prose-slate max-w-none rounded-md border bg-slate-50 p-4"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
            />
          ) : (
            <div className="min-h-[280px] whitespace-pre-wrap rounded-md border bg-slate-50 p-4 text-sm text-slate-700">
              {content}
            </div>
          )
        ) : (
          <div className="flex min-h-[280px] items-center justify-center rounded-md border border-dashed text-sm text-slate-500">
            Start writing to see a preview.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
