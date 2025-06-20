// Types para o sistema de feedbacks
export type FeedbackType =
  | "SUGGESTION"
  | "BUG_REPORT"
  | "FEEDBACK"
  | "FEATURE_REQUEST"
  | "OTHER";
export type FeedbackPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type FeedbackStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface BrowserInfo {
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  screen: {
    width: number;
    height: number;
  };
  language: string;
  platform: string;
  cookieEnabled: boolean;
}

export interface Feedback {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  email?: string;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  browser_info?: BrowserInfo;
  page_url?: string;
  user_id?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface CreateFeedbackData {
  type: FeedbackType;
  title: string;
  description: string;
  email?: string;
  priority?: FeedbackPriority;
  browser_info?: BrowserInfo;
  page_url?: string;
}

export interface UpdateFeedbackData {
  title?: string;
  description?: string;
  priority?: FeedbackPriority;
  status?: FeedbackStatus;
  admin_notes?: string;
  resolved_at?: string;
}

// Para estatísticas e dashboard admin
export interface FeedbackStats {
  total: number;
  byType: Record<FeedbackType, number>;
  byStatus: Record<FeedbackStatus, number>;
  byPriority: Record<FeedbackPriority, number>;
  recentCount: number; // últimos 7 dias
}

// Para o formulário de feedback
export interface FeedbackFormData {
  type: FeedbackType;
  title: string;
  description: string;
  email?: string;
  includeContactInfo: boolean;
}
