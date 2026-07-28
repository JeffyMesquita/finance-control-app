export type ApiSuccess<T> = {
  success: true;
  data?: T;
};

export interface ApiFailure {
  success: false;
  error: string;
  code?: string;
  requestId?: string;
  fieldErrors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type PaginatedApiResponse<T> =
  | (ApiSuccess<T[]> & {
      total: number;
      page: number;
      limit: number;
      hasMore: boolean;
    })
  | ApiFailure;

interface ApiAppMetadata {
  provider?: string;
  role?: string;
}

interface ApiUserMetadata {
  avatar_url?: string;
}

export interface ApiSession {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  app_metadata?: ApiAppMetadata;
  user_metadata?: ApiUserMetadata;
  email_confirmed_at?: string | null;
  created_at?: string;
  last_sign_in_at?: string | null;
}
