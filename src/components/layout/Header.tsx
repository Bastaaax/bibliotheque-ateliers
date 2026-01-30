import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SearchBar } from '@/components/search/SearchBar'
import { useAuth } from '@/hooks/useAuth'
import { PlusCircle, LogOut, Settings, LayoutDashboard } from 'lucide-react'

export function Header() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const isDashboard = location.pathname === '/'
  const searchValue = searchParams.get('q') ?? ''
  const onSearchChange = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value.trim()) next.set('q', value.trim())
    else next.delete('q')
    setSearchParams(next)
  }

  const handleSignOut = async () => {
    await signOut.mutateAsync()
    navigate('/login')
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link to="/" className="flex items-center gap-2 font-heading text-2xl text-primary">
        Bibliothèque d&apos;Ateliers
      </Link>

      <div className="flex flex-1 items-center justify-end gap-4">
        {isDashboard && (
          <div className="hidden w-full max-w-sm md:block">
            <SearchBar value={searchValue} onChange={onSearchChange} />
          </div>
        )}

        <Button asChild size="sm">
          <Link to="/workshops/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvel atelier
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? ''} />
                <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.full_name ?? 'Utilisateur'}</p>
                <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
                {profile?.role === 'admin' && (
                  <span className="mt-1 inline-flex w-fit rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    Admin
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Tableau de bord
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/integrations">
                <Settings className="mr-2 h-4 w-4" />
                Intégrations
              </Link>
            </DropdownMenuItem>
            {profile?.role === 'admin' && (
              <>
                <DropdownMenuItem asChild>
                  <Link to="/tags">
                    <Settings className="mr-2 h-4 w-4" />
                    Gestion des tags
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/users">
                    <Settings className="mr-2 h-4 w-4" />
                    Utilisateurs
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} disabled={signOut.isPending}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
