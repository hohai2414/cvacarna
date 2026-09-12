import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold text-primary text-xl">Career Arcana</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/dashboard" className="transition-colors hover:text-primary">Dashboard</Link>
            <Link href="/jobs" className="transition-colors hover:text-primary">Jobs</Link>
            <Link href="/candidates" className="transition-colors hover:text-primary">Candidates</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <form action="/auth/signout" method="post">
                <Button variant="outline" size="sm">Sign Out</Button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
