export type UserRole = 'admin' | 'contributor'

/** Profil métier : directeur (direction de stage) ou formateur */
export type ProfileType = 'director' | 'formateur'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  /** Profil métier : directeur ou formateur (optionnel, défaut formateur) */
  profile_type?: ProfileType
  avatar_url: string | null
  created_at: string
  updated_at: string
}

/** Lien ressource (PPT, doc à imprimer, etc.) */
export interface WorkshopResourceLink {
  label: string
  url: string
}

export interface Workshop {
  id: string
  icon: string | null
  title: string
  description: string | null
  content: string | null
  duration_minutes: number | null
  participants_min: number | null
  participants_max: number | null
  materials: string[]
  objectives: string[]
  /** Liens vers ressources (présentation, doc à imprimer, etc.) */
  resource_links?: WorkshopResourceLink[]
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

export interface TagCategory {
  id: string
  name: string
  sort_order: number
  created_at?: string
}

export interface Tag {
  id: string
  name: string
  category: 'workshop_type' | 'stage_type' | 'custom'
  category_id: string | null
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
  /** Texte d'un objectif pour filtrer les ateliers qui contiennent cet objectif */
  objectiveText?: string
}

export interface WorkshopFormData {
  icon?: string | null
  title: string
  description?: string
  content?: string
  duration_minutes?: number
  participants_min?: number
  participants_max?: number
  materials: string[]
  objectives: string[]
  resource_links?: WorkshopResourceLink[]
  tagIds: string[]
}
