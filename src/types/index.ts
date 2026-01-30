export type UserRole = 'admin' | 'contributor'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Workshop {
  id: string
  title: string
  description: string | null
  content: string | null
  duration_minutes: number | null
  participants_min: number | null
  participants_max: number | null
  materials: string[]
  objectives: string[]
  creator_id: string | null
  creator?: Profile
  created_at: string
  updated_at: string
  source: 'manual' | 'notion' | 'gdrive'
  source_id: string | null
  source_url: string | null
  tags?: Tag[]
  attachments?: Attachment[]
}

export interface Tag {
  id: string
  name: string
  category: 'workshop_type' | 'stage_type' | 'custom'
  color: string
  created_at: string
}

export interface WorkshopTag {
  workshop_id: string
  tag_id: string
  created_at: string
}

export interface Attachment {
  id: string
  workshop_id: string
  file_name: string
  file_path: string
  file_type: string | null
  file_size: number | null
  uploaded_by: string | null
  created_at: string
}

export interface Integration {
  id: string
  user_id: string
  type: 'notion' | 'gdrive'
  access_token: string | null
  refresh_token: string | null
  config: Record<string, unknown>
  last_sync: string | null
  created_at: string
}

export interface Invitation {
  id: string
  email: string
  role: 'contributor'
  invited_by: string | null
  token: string
  expires_at: string
  accepted_at: string | null
  created_at: string
}

export interface WorkshopFilters {
  search?: string
  tagIds?: string[]
  creatorId?: string
  dateFrom?: string
  dateTo?: string
  durationMin?: number
  durationMax?: number
  participantsMin?: number
  participantsMax?: number
}

export interface WorkshopFormData {
  title: string
  description?: string
  content?: string
  duration_minutes?: number
  participants_min?: number
  participants_max?: number
  materials: string[]
  objectives: string[]
  tagIds: string[]
}
