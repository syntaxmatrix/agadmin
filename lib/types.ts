export type SubscriptionPlan = "Free" | "Premium" | "Ultimate";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  subscription: SubscriptionPlan;
  expiry: string | null;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  freeUsers: number;
  premiumUsers: number;
  ultimateUsers: number;
  newUsersToday: number;
}

export interface SessionUser {
  email: string;
  name?: string;
  token: string;
  role: "User" | "Admin";
}

export type EmailBodyType = "text" | "html";
export type EmailSenderType = "support" | "updates" | "grievance";

export interface InboxAttachment {
  id: string;
  name: string;
  size: number | null;
  contentType?: string | null;
}

export interface InboxEmailSummary {
  id: string;
  from: string;
  subject: string;
  receivedAt: string;
  status: string;
  to?: string[];
}

export interface InboxEmailDetail extends InboxEmailSummary {
  html?: string | null;
  text?: string | null;
  attachments: InboxAttachment[];
}
