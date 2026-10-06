import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal } from 'lucide-react'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SnippetCard } from '@/components/SnippetCard'
import { SnippetListItem } from '@/components/SnippetListItem'
import { SnippetViewToggle } from '@/components/SnippetViewToggle'
import { useSnippetView } from '@/lib/useSnippetView'

export function LibraryPage() {
  const [q, setQ] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [tag, setTag] = useState<string>('')
  const [projectId, setProjectId] = useState<string>('')
  const [view, setView] = useSnippetView()

  const filters = useMemo(
    () => ({
      q: q.trim() || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      tag: tag || undefined,
      projectId: projectId ? Number(projectId) : undefined,
    }),
    [q, categoryId, tag, projectId],
  )

  const snippetsQuery = useQuery({
    queryKey: ['snippets', filters],
    queryFn: () => api.listSnippets(filters),
  })
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: api.listCategories })
  const tagsQuery = useQuery({ queryKey: ['tags'], queryFn: api.listTags })
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: api.listProjects })

  const snippets = snippetsQuery.data ?? []

  return (
    <div className="mx-auto max-w-7xl p-6">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Library</h1>
        <p className="text-sm text-muted-foreground">
          {snippets.length} reusable {snippets.length === 1 ? 'snippet' : 'snippets'}
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or description..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-36"
          >
            <option value="">All categories</option>
            {categoriesQuery.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select value={tag} onChange={(e) => setTag(e.target.value)} className="w-32">
            <option value="">All tags</option>
            {tagsQuery.data?.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </Select>
          <Select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-36"
          >
            <option value="">All projects</option>
            {projectsQuery.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <SnippetViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {snippetsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : snippetsQuery.isError ? (
        <p className="text-sm text-destructive">
          Failed to load snippets. Is the backend running on port 8091?
        </p>
      ) : snippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <p className="font-medium">No snippets found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try clearing filters or create a new snippet.
          </p>
        </div>
      ) : view === 'card' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {snippets.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
          {snippets.map((snippet) => (
            <SnippetListItem key={snippet.id} snippet={snippet} />
          ))}
        </div>
      )}
    </div>
  )
}
