import { NavLink } from 'react-router-dom'
import { Boxes, FolderKanban, Library, Plus, Tags } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from './ThemeSwitcher'

const navItems = [
  { to: '/', label: 'Library', icon: Library, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban, end: false },
  { to: '/taxonomy', label: 'Categories & Tags', icon: Tags, end: false },
]

export function Sidebar({ onNewSnippet }: { onNewSnippet: () => void }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Boxes className="size-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold">VibeBox</span>
          <span className="text-[11px] text-muted-foreground">Code library</span>
        </div>
      </div>

      <div className="px-3">
        <Button className="w-full justify-start" onClick={onNewSnippet}>
          <Plus className="size-4" />
          New snippet
        </Button>
      </div>

      <nav className="mt-4 flex flex-col gap-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-3">
        <ThemeSwitcher />
      </div>
    </aside>
  )
}
