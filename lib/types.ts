export interface UserProfile {
  id: string
  full_name: string | null
  phone: string | null
  birth_date: string | null
  document_id: string | null
  address: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  profile_image: string | null
  bio: string | null
  profession: string | null
  created_at: string | null
  updated_at: string | null
}

export interface UserSettings {
  id: string
  default_currency: string
  date_format: string
  theme: string
  email_notifications: boolean
  app_notifications: boolean
  budget_alerts: boolean
  due_date_alerts: boolean
  language: string
  created_at: string | null
  updated_at: string | null
}
