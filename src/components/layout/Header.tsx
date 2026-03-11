import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
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
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import {
  LogOut,
  Settings,
  Tags,
  Users,
  Menu,
  PlusCircle,
  Library,
  UserCircle,
  GraduationCap,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const mainNavItems = [
  { to: '/', label: "Banque d'ateliers", icon: Library },
  { to: '/my-workshops', label: 'Mes ateliers', icon: UserCircle },
] as const

export function Header() {
  const { profile, signOut, isDirector } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const handleSignOut = async () => {
    await signOut.mutateAsync()
    navigate('/login')
  }

  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const espaceLabel = isDirector ? 'Directeurs / Directrices' : 'Formateurs / Formatrices'
  const espaceTo = '/espace'

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? '?'

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const linkClass = (path: string) =>
    cn(
      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-colors',
      isActive(path)
        ? 'bg-sgdf-default-hover text-white'
        : 'text-white hover:bg-sgdf-default-hover'
    )

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 bg-sgdf-bg-primary px-4 text-white shadow-md md:px-6">
      {/* Menu mobile */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-sgdf-default-hover"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] border-0 bg-sgdf-bg-primary text-white">
          <SheetHeader>
            <SheetTitle className="sr-only text-white">Navigation</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-1" aria-label="Navigation principale">
            {mainNavItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileNavOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn('w-full justify-start gap-2 font-bold uppercase tracking-wide whitespace-nowrap text-white hover:bg-sgdf-default-hover', isActive(to) && 'bg-sgdf-default-hover')}
                  size="sm"
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {label}
                </Button>
              </Link>
            ))}
            <Link to={espaceTo} onClick={() => setMobileNavOpen(false)}>
              <Button
                variant="ghost"
                className={cn('w-full justify-start gap-2 font-bold uppercase tracking-wide whitespace-nowrap text-white hover:bg-sgdf-default-hover', isActive(espaceTo) && 'bg-sgdf-default-hover')}
                size="sm"
              >
                <GraduationCap className="h-4 w-4 shrink-0" aria-hidden />
                {espaceLabel}
              </Button>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Logo / Accueil */}
      <Link
        to="/"
        className="flex shrink-0 items-center gap-2 font-heading text-lg text-white md:text-xl"
        aria-label="Accueil - Bibliothèque d'Ateliers"
      >
        <Library className="h-6 w-6 shrink-0 md:h-7 md:w-7" aria-hidden />
        <span className="hidden sm:inline">Bibliothèque d&apos;Ateliers</span>
      </Link>

      {/* Navigation principale (desktop) */}
      <nav className="hidden flex-1 items-center gap-0.5 md:flex" aria-label="Navigation principale">
        {mainNavItems.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}>
            <span className={linkClass(to)}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </span>
          </Link>
        ))}
        <Link to={espaceTo}>
          <span className={linkClass(espaceTo)}>
            <GraduationCap className="h-4 w-4 shrink-0" aria-hidden />
            {espaceLabel}
          </span>
        </Link>
      </nav>

      {/* Droite : recherche (lien vers banque + focus champ), nouvel atelier, avatar */}
      <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
        {location.pathname === '/' ? (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-white hover:bg-sgdf-default-hover"
            aria-label="Rechercher (Banque d'ateliers)"
            onClick={() => {
              const next = new URLSearchParams(searchParams)
              next.set('focus', 'search')
              navigate(`/?${next.toString()}`)
            }}
          >
            <Search className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-white hover:bg-sgdf-default-hover"
            aria-label="Rechercher (Banque d'ateliers)"
            asChild
          >
            <Link to="/?focus=search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
        )}
        <Button variant="brand" size="sm" className="shrink-0 gap-1.5 md:gap-2" asChild>
          <Link to="/workshops/new">
            <PlusCircle className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Nouvel atelier</span>
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 shrink-0 rounded-full text-white hover:bg-sgdf-default-hover"
              aria-label="Ouvrir le menu compte"
            >
              <Avatar className="h-9 w-9 border-2 border-white/30">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? ''} />
                <AvatarFallback className="bg-white/20 text-sm text-white">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.full_name ?? 'Utilisateur ou utilisatrice'}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{profile?.email}</p>
                {profile?.role === 'admin' && (
                  <span className="mt-1 inline-flex w-fit rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    Admin
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            {profile?.role === 'admin' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/tags">
                    <Tags className="mr-2 h-4 w-4" />
                    Gestion des tags
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/users">
                    <Users className="mr-2 h-4 w-4" />
                    Utilisateurs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/integrations">
                    <Settings className="mr-2 h-4 w-4" />
                    Intégrations
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
