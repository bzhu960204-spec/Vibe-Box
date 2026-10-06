import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Pencil, Sparkles, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { SandpackEditor } from '@/components/SandpackEditor'

export function SnippetDetailPage() {
  const { id } = useParams()
  const snippetId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { data: snippet, isLoading, isError } = useQuery({
    queryKey: ['snippet', snippetId],
    queryFn: () => api.getSnippet(snippetId),
    enabled: Number.isFinite(snippetId),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteSnippet(snippetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] })
      navigate('/')
    },
  })

  if (isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading...</p>
  }
  if (isError || !snippet) {
    return <p className="p-6 text-sm text-destructive">Snippet not found.</p>
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/snippets/${snippet.id}/edit`)}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <header className="mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{snippet.title}</h1>
          <Badge variant="secondary">
            {snippet.type === 'MODULE' ? 'Module' : 'Component'}
          </Badge>
        </div>
        {snippet.description && (
          <p className="mt-2 text-muted-foreground">{snippet.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {snippet.projectName && (
            <Badge variant="outline">Project: {snippet.projectName}</Badge>
          )}
          {snippet.categoryName && (
            <Badge variant="outline">{snippet.categoryName}</Badge>
          )}
          {snippet.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </header>

      <div className="mb-6">
        <SandpackEditor
          files={snippet.files}
          entryFile={snippet.entryFile}
          dependencies={snippet.dependencies}
          editorHeight={460}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Edit the code above to experiment live. Changes here are not saved — use
          Edit to persist them.
        </p>
      </div>

      {(snippet.notes || snippet.promptArchive) && (
        <div className="grid gap-4 md:grid-cols-2">
          {snippet.notes && (
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4 text-primary" />
                Notes
              </h2>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {snippet.notes}
              </p>
            </section>
          )}
          {snippet.promptArchive && (
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-2 text-sm font-semibold">Prompt archive</h2>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {snippet.promptArchive}
              </p>
            </section>
          )}
        </div>
      )}

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete snippet?"
        description={`"${snippet.title}" will be permanently removed.`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
