import { NavLink } from 'react-router-dom'
import {
  Boxes,
  FolderKanban,
  Library,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Tags,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from './ThemeSwitcher'

const navItems = [
  { to: '/', label: 'Library', icon: Library, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban, end: false },
  { to: '/taxonomy', label: 'Categories & Tags', icon: Tags, end: false },
]

type SidebarProps = {
  onNewSnippet: () => void
  collapsed: boolean
  onToggleCollapsed: () => void
}

export function Sidebar({ onNewSnippet, collapsed, onToggleCollapsed }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div
        className={cn(
          'flex items-center py-5',
          collapsed ? 'flex-col gap-3 px-2' : 'gap-2 px-5',
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Boxes className="size-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold">VibeBox</span>
              <span className="text-[11px] text-muted-foreground">Code library</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn('size-7 shrink-0 text-muted-foreground', !collapsed && 'ml-auto')}
          onClick={onToggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </div>

      <div className={cn(collapsed ? 'px-2' : 'px-3')}>
        <Button
          className={cn('w-full', collapsed ? 'justify-center px-0' : 'justify-start')}
          onClick={onNewSnippet}
          title={collapsed ? 'New snippet' : undefined}
        >
          <Plus className="size-4" />
          {!collapsed && 'New snippet'}
        </Button>
      </div>

      <nav className={cn('mt-4 flex flex-col gap-1', collapsed ? 'px-2' : 'px-3')}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <item.icon className="size-4 shrink-0" />
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      <div className={cn('mt-auto', collapsed ? 'p-2' : 'p-3')}>
        <ThemeSwitcher collapsed={collapsed} />
      </div>
    </aside>
  )
}
