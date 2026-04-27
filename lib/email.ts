import api from "@/lib/api";
import type {
  EmailBodyType,
  EmailSenderType,
  InboxAttachment,
  InboxEmailDetail,
  InboxEmailSummary
} from "@/lib/types";

type ApiEnvelope<T> = {
  data?: T;
  statusCode?: number;
  success?: boolean;
  message?: string;
};

type RawInboxListItem = {
  id?: string;
  object?: string;
  from?: string;
  subject?: string;
  created_at?: string;
  received_at?: string;
  last_event?: string;
  to?: string | string[];
};

type RawInboxDetail = RawInboxListItem & {
  html?: string;
  text?: string;
  attachments?: RawInboxAttachment[];
};

type RawInboxAttachment = {
  id?: string;
  filename?: string;
  name?: string;
  content_type?: string;
  contentType?: string;
  size?: number;
};

function getPayload<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in (payload as ApiEnvelope<T>)) {
    return ((payload as ApiEnvelope<T>).data ?? {}) as T;
  }

  return payload as T;
}

export function sanitizeHtml(input: string) {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function normalizeAttachment(item: RawInboxAttachment): InboxAttachment {
  return {
    id: item.id ?? item.filename ?? item.name ?? crypto.randomUUID(),
    name: item.filename ?? item.name ?? "attachment",
    size: typeof item.size === "number" ? item.size : null,
    contentType: item.content_type ?? item.contentType ?? null
  };
}

function normalizeSummary(item: RawInboxListItem): InboxEmailSummary {
  const to = Array.isArray(item.to) ? item.to : item.to ? [item.to] : [];

  return {
    id: item.id ?? crypto.randomUUID(),
    from: item.from ?? "Unknown sender",
    subject: item.subject ?? "(No subject)",
    receivedAt: item.received_at ?? item.created_at ?? new Date().toISOString(),
    status: item.last_event ?? "received",
    to
  };
}

export function normalizeInboxList(payload: unknown): InboxEmailSummary[] {
  const data = getPayload<unknown>(payload);
  const items = Array.isArray(data)
    ? data
    : Array.isArray((data as { data?: RawInboxListItem[] })?.data)
      ? (data as { data?: RawInboxListItem[] }).data ?? []
      : Array.isArray((data as { emails?: RawInboxListItem[] })?.emails)
        ? (data as { emails?: RawInboxListItem[] }).emails ?? []
        : [];

  return items.map((item) => normalizeSummary(item));
}

export function normalizeInboxDetail(payload: unknown): InboxEmailDetail {
  const data = getPayload<RawInboxDetail>(payload);
  const summary = normalizeSummary(data);

  return {
    ...summary,
    html: data.html ?? null,
    text: data.text ?? null,
    attachments: Array.isArray(data.attachments) ? data.attachments.map(normalizeAttachment) : []
  };
}

export async function sendAdminEmail(payload: {
  to: string | "all";
  subject: string;
  bodyType: EmailBodyType;
  content: string;
  senderType: EmailSenderType;
}) {
  return api.post("/email/send", payload);
}

export async function fetchInboxEmails() {
  const response = await api.get("/email/inbox");
  return normalizeInboxList(response.data);
}

export async function fetchInboxEmailById(id: string) {
  const response = await api.get(`/email/${id}`);
  return normalizeInboxDetail(response.data);
}

function base64ToBlob(base64: string, mimeType: string) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let index = 0; index < byteCharacters.length; index += 1) {
    byteNumbers[index] = byteCharacters.charCodeAt(index);
  }

  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
}

export async function downloadInboxAttachment(emailId: string, attachment: InboxAttachment) {
  const response = await api.get(`/email/${emailId}/attachments/${attachment.id}`);
  const payload = getPayload<Record<string, unknown>>(response.data);

  if (payload.content && typeof payload.content === "string") {
    const blob = base64ToBlob(payload.content, (payload.contentType as string) || "application/octet-stream");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = attachment.name;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  if (payload.url && typeof payload.url === "string") {
    window.open(payload.url, "_blank", "noopener,noreferrer");
    return;
  }

  throw new Error("Attachment download format is not supported by the frontend yet.");
}
