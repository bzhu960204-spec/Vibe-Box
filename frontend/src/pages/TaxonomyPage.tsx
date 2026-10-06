import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { api, type Named } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface TaxonomySectionProps {
  title: string
  queryKey: string
  list: () => Promise<Named[]>
  create: (name: string) => Promise<Named>
  remove: (id: number) => Promise<void>
}

function TaxonomySection({ title, queryKey, list, create, remove }: TaxonomySectionProps) {
  const queryClient = useQueryClient()
  const [value, setValue] = useState('')

  const query = useQuery({ queryKey: [queryKey], queryFn: list })

  const createMutation = useMutation({
    mutationFn: () => create(value.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      setValue('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value.trim()) createMutation.mutate()
            }}
            placeholder={`Add ${title.toLowerCase()}...`}
          />
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!value.trim() || createMutation.isPending}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {query.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing yet.</p>
          )}
          {query.data?.map((item) => (
            <Badge key={item.id} variant="secondary" className="gap-1 py-1 pr-1">
              {item.name}
              <button
                onClick={() => deleteMutation.mutate(item.id)}
                className="rounded-full p-0.5 hover:bg-background/60"
                title="Delete"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function TaxonomyPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Categories & Tags</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Organize and label your snippets.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <TaxonomySection
          title="Categories"
          queryKey="categories"
          list={api.listCategories}
          create={api.createCategory}
          remove={api.deleteCategory}
        />
        <TaxonomySection
          title="Tags"
          queryKey="tags"
          list={api.listTags}
          create={api.createTag}
          remove={api.deleteTag}
        />
      </div>
    </div>
  )
}
