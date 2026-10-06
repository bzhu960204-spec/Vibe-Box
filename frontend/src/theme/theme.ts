export type ThemeMode = 'light' | 'dark'
export type ThemeStyle = 'minimal' | 'saas' | 'ide'
export type ThemeAccent = 'indigo' | 'teal' | 'orange' | 'neutral'

export interface ThemeState {
  mode: ThemeMode
  style: ThemeStyle
  accent: ThemeAccent
}

export const STYLE_OPTIONS: { value: ThemeStyle; label: string; hint: string }[] = [
  { value: 'minimal', label: 'Minimal', hint: 'Clean developer tool' },
  { value: 'saas', label: 'Modern SaaS', hint: 'Soft, rounded cards' },
  { value: 'ide', label: 'Dark IDE', hint: 'Code editor vibe' },
]

export const ACCENT_OPTIONS: { value: ThemeAccent; label: string; swatch: string }[] = [
  { value: 'indigo', label: 'Indigo', swatch: 'hsl(243 75% 59%)' },
  { value: 'teal', label: 'Teal', swatch: 'hsl(173 80% 36%)' },
  { value: 'orange', label: 'Orange', swatch: 'hsl(24 95% 53%)' },
  { value: 'neutral', label: 'Neutral', swatch: 'hsl(240 5% 50%)' },
]

export const DEFAULT_THEME: ThemeState = {
  mode: 'dark',
  style: 'minimal',
  accent: 'indigo',
}

const STORAGE_KEY = 'vibebox-theme'

export function loadTheme(): ThemeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_THEME
    const parsed = JSON.parse(raw) as Partial<ThemeState>
    return {
      mode: parsed.mode ?? DEFAULT_THEME.mode,
      style: parsed.style ?? DEFAULT_THEME.style,
      accent: parsed.accent ?? DEFAULT_THEME.accent,
    }
  } catch {
    return DEFAULT_THEME
  }
}

export function saveTheme(state: ThemeState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function applyTheme(state: ThemeState) {
  const root = document.documentElement
  root.classList.toggle('dark', state.mode === 'dark')
  root.dataset.style = state.style
  root.dataset.accent = state.accent
  root.style.colorScheme = state.mode
}
