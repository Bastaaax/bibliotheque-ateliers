import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import { Users, Mail, UserPlus } from 'lucide-react'
import type { Profile } from '@/types'
import type { Invitation } from '@/types'

export default function UsersManagementPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      setProfiles((profilesData as Profile[]) ?? [])
      const { data: invData } = await supabase.from('invitations').select('*').is('accepted_at', null)
      setInvitations((invData as Invitation[]) ?? [])
    }
    load()
  }, [])

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    try {
      const { error } = await supabase.from('invitations').insert({
        email: inviteEmail.trim(),
        role: 'contributor',
      } as Record<string, unknown>)
      if (error) throw error
      toast({ title: 'Invitation envoyée', description: `Un email a été envoyé à ${inviteEmail}.` })
      setInviteEmail('')
      const { data } = await supabase.from('invitations').select('*').is('accepted_at', null)
      setInvitations((data as Invitation[]) ?? [])
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible d\'inviter.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container space-y-6 py-6">
        <h1 className="font-heading text-3xl font-bold">Gestion des utilisateurs</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Inviter un contributeur
            </CardTitle>
            <CardDescription>
              Envoyez une invitation par email. L&apos;utilisateur pourra s&apos;inscrire avec ce lien.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="email@exemple.fr"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <Button className="self-end" onClick={handleInvite} disabled={!inviteEmail.trim()}>
              Envoyer l&apos;invitation
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Utilisateurs
            </CardTitle>
            <CardDescription>Liste des comptes ayant accès à la bibliothèque.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {profiles.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{p.full_name ?? '—'}</span>
                    <span className="text-sm text-muted-foreground">{p.email}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        p.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {p.role === 'admin' ? 'Admin' : 'Contributeur'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invitations en attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {invitations.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between text-sm">
                    <span>{inv.email}</span>
                    <span className="text-muted-foreground">
                      Expire le {new Date(inv.expires_at).toLocaleDateString('fr-FR')}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
