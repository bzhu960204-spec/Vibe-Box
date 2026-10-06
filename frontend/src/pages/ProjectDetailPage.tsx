import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FolderKanban, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { SnippetCard } from '@/components/SnippetCard'
import { SnippetListItem } from '@/components/SnippetListItem'
import { SnippetViewToggle } from '@/components/SnippetViewToggle'
import { useSnippetView } from '@/lib/useSnippetView'

export function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const projectId = Number(id)
  const [view, setView] = useSnippetView()

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.getProject(projectId),
    enabled: Number.isFinite(projectId),
  })

  const filters = useMemo(() => ({ projectId }), [projectId])
  const snippetsQuery = useQuery({
    queryKey: ['snippets', filters],
    queryFn: () => api.listSnippets(filters),
    enabled: Number.isFinite(projectId),
  })

  const snippets = snippetsQuery.data ?? []

  if (projectQuery.isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading...</p>
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
          <ArrowLeft className="size-4" />
          Back to projects
        </Button>
        <p className="mt-6 text-sm text-destructive">Project not found.</p>
      </div>
    )
  }

  const project = projectQuery.data

  return (
    <div className="mx-auto max-w-7xl p-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate('/projects')}
      >
        <ArrowLeft className="size-4" />
        Back to projects
      </Button>

      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <FolderKanban className="mt-1 size-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {snippets.length} {snippets.length === 1 ? 'snippet' : 'snippets'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SnippetViewToggle view={view} onChange={setView} />
          <Button onClick={() => navigate('/snippets/new')}>
            <Plus className="size-4" />
            New snippet
          </Button>
        </div>
      </header>

      {snippetsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : snippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <p className="font-medium">No snippets in this project yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a snippet and assign it to this project.
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
