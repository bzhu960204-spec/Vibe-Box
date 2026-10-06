import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/theme/theme-context'
import { ACCENT_OPTIONS, STYLE_OPTIONS } from '@/theme/theme'

export function ThemeSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const { mode, style, accent, toggleMode, setStyle, setAccent } = useTheme()

  if (collapsed) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="size-9 w-full"
        onClick={toggleMode}
        title={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}
        aria-label={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}
      >
        {mode === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-background/50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Appearance</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={toggleMode}
          title={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {mode === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Style
        </span>
        <div className="grid grid-cols-3 gap-1">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStyle(opt.value)}
              title={opt.hint}
              className={cn(
                'rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors',
                style === opt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-accent',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Accent
        </span>
        <div className="flex gap-2">
          {ACCENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAccent(opt.value)}
              title={opt.label}
              aria-label={opt.label}
              className={cn(
                'size-6 rounded-full ring-offset-2 ring-offset-background transition-all',
                accent === opt.value
                  ? 'ring-2 ring-ring scale-110'
                  : 'ring-1 ring-border hover:scale-105',
              )}
              style={{ backgroundColor: opt.swatch }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
