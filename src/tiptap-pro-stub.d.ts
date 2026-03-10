/**
 * Stubs pour les paquets @tiptap-pro/* (registry privé).
 * Permet au build de passer sans accès TipTap Pro.
 * Les fonctionnalités AI/collab ne sont pas utilisées dans l’app (éditeur open source).
 */
declare module '@tiptap-pro/extension-ai' {
  export type Language = string
  export type Tone = string
  export interface TextOptions {
    [key: string]: unknown
  }
}

declare module '@tiptap-pro/provider' {
  export class TiptapCollabProvider {
    constructor(options: unknown)
    destroy(): void
  }
}
