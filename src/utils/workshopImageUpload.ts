import { supabase } from '@/lib/supabase'
import { WORKSHOP_ATTACHMENTS_BUCKET } from '@/utils/constants'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const EXT_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
}

function getExt(mime: string): string {
  return EXT_MAP[mime] ?? '.jpg'
}

/**
 * Upload une image pour l'éditeur rich text (blocs, fiche synthèse).
 * Stockée dans workshop-attachments/inline/{userId}/{uuid}.ext
 */
export async function uploadWorkshopInlineImage(
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
): Promise<string> {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('Type de fichier non supporté. Utilisez une image (JPEG, PNG, GIF, WebP).')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Taille maximale : ${MAX_FILE_SIZE / (1024 * 1024)} Mo`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const ext = getExt(file.type)
  const path = `inline/${user.id}/${crypto.randomUUID()}${ext}`

  if (abortSignal?.aborted) throw new Error('Upload annulé')

  const { data, error } = await supabase.storage
    .from(WORKSHOP_ATTACHMENTS_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw new Error(error.message)
  onProgress?.({ progress: 100 })

  const { data: urlData } = supabase.storage.from(WORKSHOP_ATTACHMENTS_BUCKET).getPublicUrl(data.path)
  return urlData.publicUrl
}

export { MAX_FILE_SIZE as WORKSHOP_IMAGE_MAX_SIZE }
