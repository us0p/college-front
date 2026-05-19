'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  Shield,
  LogOut,
  GraduationCap,
  ChevronLeft,
  Newspaper,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import type { UiItemName } from '@/lib/ui-item-routes'

const sidebarLinks: { href: string; label: string; icon: React.ElementType; uiItemName: UiItemName }[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, uiItemName: 'admin_dashboard' },
  { href: '/admin/posts', label: 'Posts do Blog', icon: Newspaper, uiItemName: 'admin_blog_post' },
  { href: '/admin/documentos', label: 'Documentos', icon: FileText, uiItemName: 'admin_documents' },
  { href: '/admin/usuarios', label: 'Usuários', icon: Users, uiItemName: 'admin_users' },
  { href: '/admin/grupos', label: 'Grupos de Acesso', icon: Shield, uiItemName: 'admin_access_groups' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout, canAccessUiItem } = useAuth()

  const visibleLinks = sidebarLinks.filter((link) => canAccessUiItem(link.uiItemName))

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground">Mural</p>
          <p className="text-xs text-sidebar-foreground/60">Painel Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar ao site
        </Link>

        <div className="mt-2 flex items-center justify-between rounded-lg bg-sidebar-accent/30 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.username}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-8 w-8 shrink-0 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
