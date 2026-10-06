import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react'
import type { SandpackFiles } from '@codesandbox/sandpack-react'
import { ArrowLeft, FileX2, Plus, Star } from 'lucide-react'
import { api, type SnippetFile, type SnippetRequest, type SnippetType } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useTheme } from '@/theme/theme-context'

const STARTER_FILE: SnippetFile = {
  path: '/App.js',
  code: `export default function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>New snippet</h1>
    </div>
  )
}
`,
}

function CodeSync({ onFiles }: { onFiles: (files: Record<string, string>) => void }) {
  const { sandpack } = useSandpack()
  useEffect(() => {
    const map: Record<string, string> = {}
    for (const [path, file] of Object.entries(sandpack.files)) {
      map[path] = file.code
    }
    onFiles(map)
  }, [sandpack.files, onFiles])
  return null
}

function parseDeps(raw: string): Record<string, string> {
  try {
    const parsed = JSON.parse(raw || '{}')
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string>
    }
  } catch {
    /* ignore */
  }
  return {}
}

export function SnippetEditorPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const snippetId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { mode } = useTheme()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<SnippetType>('COMPONENT')
  const [projectId, setProjectId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [dependencies, setDependencies] = useState('{}')
  const [notes, setNotes] = useState('')
  const [promptArchive, setPromptArchive] = useState('')
  const [files, setFiles] = useState<SnippetFile[]>([STARTER_FILE])
  const [entryFile, setEntryFile] = useState('/App.js')
  const [error, setError] = useState<string | null>(null)

  const codeRef = useRef<Record<string, string>>({})

  const existing = useQuery({
    queryKey: ['snippet', snippetId],
    queryFn: () => api.getSnippet(snippetId),
    enabled: isEdit && Number.isFinite(snippetId),
  })
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: api.listCategories })
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: api.listProjects })

  useEffect(() => {
    if (existing.data) {
      const s = existing.data
      setTitle(s.title)
      setDescription(s.description ?? '')
      setType(s.type)
      setProjectId(s.projectId ? String(s.projectId) : '')
      setCategoryId(s.categoryId ? String(s.categoryId) : '')
      setTagsInput(s.tags.join(', '))
      setDependencies(s.dependencies || '{}')
      setNotes(s.notes ?? '')
      setPromptArchive(s.promptArchive ?? '')
      setFiles(s.files.length ? s.files : [STARTER_FILE])
      setEntryFile(s.entryFile)
      codeRef.current = Object.fromEntries(s.files.map((f) => [f.path, f.code]))
    }
  }, [existing.data])

  const providerKey = useMemo(() => files.map((f) => f.path).join('|'), [files])

  const sandpackFiles = useMemo<SandpackFiles>(() => {
    const map: SandpackFiles = {}
    for (const f of files) {
      map[f.path] = { code: codeRef.current[f.path] ?? f.code }
    }
    return map
  }, [files])

  const addFile = () => {
    const path = window.prompt('New file path (e.g. /Button.js)')
    if (!path) return
    const normalized = path.startsWith('/') ? path : `/${path}`
    if (files.some((f) => f.path === normalized)) return
    setFiles((prev) => [...prev, { path: normalized, code: '' }])
  }

  const removeFile = (path: string) => {
    if (files.length === 1) return
    setFiles((prev) => prev.filter((f) => f.path !== path))
    if (entryFile === path) {
      const next = files.find((f) => f.path !== path)
      if (next) setEntryFile(next.path)
    }
  }

  const mutation = useMutation({
    mutationFn: (body: SnippetRequest) =>
      isEdit ? api.updateSnippet(snippetId, body) : api.createSnippet(body),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] })
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['snippet', saved.id] })
      navigate(`/snippets/${saved.id}`)
    },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : 'Save failed'),
  })

  const handleSave = () => {
    setError(null)
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    try {
      JSON.parse(dependencies || '{}')
    } catch {
      setError('Dependencies must be valid JSON.')
      return
    }
    const resolvedFiles: SnippetFile[] = files.map((f) => ({
      path: f.path,
      code: codeRef.current[f.path] ?? f.code,
    }))
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    mutation.mutate({
      title: title.trim(),
      description: description.trim() || null,
      type,
      projectId: projectId ? Number(projectId) : null,
      categoryId: categoryId ? Number(categoryId) : null,
      entryFile,
      dependencies: dependencies || '{}',
      template: 'react',
      notes: notes.trim() || null,
      promptArchive: promptArchive.trim() || null,
      tags,
      files: resolvedFiles,
    })
  }

  if (isEdit && existing.isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading...</p>
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button onClick={handleSave} disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : isEdit ? 'Save changes' : 'Create snippet'}
        </Button>
      </div>

      <h1 className="mb-5 text-2xl font-bold tracking-tight">
        {isEdit ? 'Edit snippet' : 'New snippet'}
      </h1>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Gradient Button"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">Type</Label>
          <Select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as SnippetType)}
          >
            <option value="COMPONENT">Component (single)</option>
            <option value="MODULE">Module (multi-file)</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short summary"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="project">Project</Label>
          <Select
            id="project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">None</option>
            {projectsQuery.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">None</option>
            {categoriesQuery.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Hooks, Tailwind"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deps">Dependencies (JSON)</Label>
          <Input
            id="deps"
            value={dependencies}
            onChange={(e) => setDependencies(e.target.value)}
            placeholder='{"lodash":"^4.17.21"}'
            className="font-mono text-xs"
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <Label>Code & live preview</Label>
          <Button variant="outline" size="sm" onClick={addFile}>
            <Plus className="size-4" />
            Add file
          </Button>
        </div>

        <div className="mb-2 flex flex-wrap gap-1.5">
          {files.map((f) => (
            <div
              key={f.path}
              className={cn(
                'flex items-center gap-1 rounded-md border px-2 py-1 text-xs',
                entryFile === f.path
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground',
              )}
            >
              <button
                type="button"
                title="Set as entry file"
                onClick={() => setEntryFile(f.path)}
              >
                <Star
                  className={cn('size-3', entryFile === f.path && 'fill-primary')}
                />
              </button>
              <span className="font-mono">{f.path}</span>
              {files.length > 1 && (
                <button
                  type="button"
                  title="Remove file"
                  onClick={() => removeFile(f.path)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <FileX2 className="size-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        <SandpackProvider
          key={providerKey}
          template="react"
          theme={mode}
          files={sandpackFiles}
          customSetup={{ dependencies: parseDeps(dependencies) }}
          options={{ activeFile: sandpackFiles[entryFile] ? entryFile : undefined }}
        >
          <CodeSync onFiles={(f) => (codeRef.current = f)} />
          <SandpackLayout>
            <SandpackCodeEditor
              showTabs
              showLineNumbers
              showInlineErrors
              wrapContent
              style={{ height: 440 }}
            />
            <SandpackPreview
              showNavigator={false}
              showOpenInCodeSandbox={false}
              showRefreshButton
              style={{ height: 440 }}
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Notes (what makes this code good)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prompt">Prompt archive</Label>
          <Textarea
            id="prompt"
            value={promptArchive}
            onChange={(e) => setPromptArchive(e.target.value)}
            rows={4}
            placeholder="The prompt used to generate this code"
          />
        </div>
      </div>
    </div>
  )
}
