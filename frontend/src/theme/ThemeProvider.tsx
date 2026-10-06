import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ThemeContext } from './theme-context'
import {
  applyTheme,
  loadTheme,
  saveTheme,
  type ThemeAccent,
  type ThemeMode,
  type ThemeState,
  type ThemeStyle,
} from './theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(() => loadTheme())

  useEffect(() => {
    applyTheme(state)
    saveTheme(state)
  }, [state])

  const setMode = useCallback((mode: ThemeMode) => setState((s) => ({ ...s, mode })), [])
  const toggleMode = useCallback(
    () => setState((s) => ({ ...s, mode: s.mode === 'dark' ? 'light' : 'dark' })),
    [],
  )
  const setStyle = useCallback((style: ThemeStyle) => setState((s) => ({ ...s, style })), [])
  const setAccent = useCallback((accent: ThemeAccent) => setState((s) => ({ ...s, accent })), [])

  return (
    <ThemeContext.Provider
      value={{ ...state, setMode, toggleMode, setStyle, setAccent }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
