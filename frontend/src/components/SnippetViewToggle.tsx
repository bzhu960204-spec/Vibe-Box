import { LayoutGrid, List } from 'lucide-react'
import type { SnippetView } from '@/lib/useSnippetView'
import { cn } from '@/lib/utils'

interface SnippetViewToggleProps {
  view: SnippetView
  onChange: (view: SnippetView) => void
  className?: string
}

export function SnippetViewToggle({ view, onChange, className }: SnippetViewToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-input bg-transparent p-1',
        className,
      )}
    >
      <button
        type="button"
        aria-label="Card view"
        aria-pressed={view === 'card'}
        onClick={() => onChange('card')}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded transition-colors',
          view === 'card'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )}
      >
        <LayoutGrid className="size-4" />
      </button>
      <button
        type="button"
        aria-label="List view"
        aria-pressed={view === 'list'}
        onClick={() => onChange('list')}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded transition-colors',
          view === 'list'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )}
      >
        <List className="size-4" />
      </button>
    </div>
  )
}
