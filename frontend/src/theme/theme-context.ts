import { createContext, useContext } from 'react'
import type { ThemeAccent, ThemeMode, ThemeState, ThemeStyle } from './theme'

export interface ThemeContextValue extends ThemeState {
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  setStyle: (style: ThemeStyle) => void
  setAccent: (accent: ThemeAccent) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
