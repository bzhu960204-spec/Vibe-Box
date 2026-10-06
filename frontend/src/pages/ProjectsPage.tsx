import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FolderKanban, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ProjectsPage() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: api.listProjects })

  const createMutation = useMutation({
    mutationFn: () => api.createProject({ name: name.trim(), description: description.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setName('')
      setDescription('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteProject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Projects</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Group snippets by the project they came from.
      </p>

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="pname">Name</Label>
            <Input
              id="pname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My dashboard app"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="pdesc">Description</Label>
            <Input
              id="pdesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || createMutation.isPending}
          >
            Add project
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {projectsQuery.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        )}
        {projectsQuery.data?.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <FolderKanban className="size-5 text-primary" />
              <div>
                <p className="font-medium">{p.name}</p>
                {p.description && (
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteMutation.mutate(p.id)}
              title="Delete project"
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
