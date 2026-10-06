import { useCallback, useEffect, useState } from 'react'

export type SnippetView = 'card' | 'list'

const STORAGE_KEY = 'vibebox:snippet-view'

function readStored(): SnippetView {
  if (typeof window === 'undefined') return 'card'
  const value = window.localStorage.getItem(STORAGE_KEY)
  return value === 'list' ? 'list' : 'card'
}

export function useSnippetView(): [SnippetView, (view: SnippetView) => void] {
  const [view, setView] = useState<SnippetView>(readStored)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, view)
  }, [view])

  const update = useCallback((next: SnippetView) => setView(next), [])

  return [view, update]
}
