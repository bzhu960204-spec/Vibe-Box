export type SnippetType = 'COMPONENT' | 'MODULE'

export interface SnippetFile {
  path: string
  code: string
}

export interface Snippet {
  id: number
  title: string
  description: string | null
  type: SnippetType
  projectId: number | null
  projectName: string | null
  categoryId: number | null
  categoryName: string | null
  entryFile: string
  dependencies: string
  template: string
  notes: string | null
  promptArchive: string | null
  tags: string[]
  files: SnippetFile[]
  createdAt: string
  updatedAt: string
}

export interface SnippetRequest {
  title: string
  description?: string | null
  type: SnippetType
  projectId?: number | null
  categoryId?: number | null
  entryFile?: string
  dependencies?: string
  template?: string
  notes?: string | null
  promptArchive?: string | null
  tags: string[]
  files: SnippetFile[]
}

export interface Named {
  id: number
  name: string
}

export interface Project {
  id: number
  name: string
  description: string | null
}

export interface SnippetFilters {
  q?: string
  projectId?: number | null
  categoryId?: number | null
  tag?: string | null
}

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.message) message = body.message
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  listSnippets(filters: SnippetFilters = {}): Promise<Snippet[]> {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.projectId != null) params.set('projectId', String(filters.projectId))
    if (filters.categoryId != null) params.set('categoryId', String(filters.categoryId))
    if (filters.tag) params.set('tag', filters.tag)
    const qs = params.toString()
    return request<Snippet[]>(`${BASE}/snippets${qs ? `?${qs}` : ''}`)
  },
  getSnippet(id: number): Promise<Snippet> {
    return request<Snippet>(`${BASE}/snippets/${id}`)
  },
  createSnippet(body: SnippetRequest): Promise<Snippet> {
    return request<Snippet>(`${BASE}/snippets`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
  updateSnippet(id: number, body: SnippetRequest): Promise<Snippet> {
    return request<Snippet>(`${BASE}/snippets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  },
  deleteSnippet(id: number): Promise<void> {
    return request<void>(`${BASE}/snippets/${id}`, { method: 'DELETE' })
  },
  listProjects(): Promise<Project[]> {
    return request<Project[]>(`${BASE}/projects`)
  },
  createProject(body: { name: string; description?: string }): Promise<Project> {
    return request<Project>(`${BASE}/projects`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
  deleteProject(id: number): Promise<void> {
    return request<void>(`${BASE}/projects/${id}`, { method: 'DELETE' })
  },
  listCategories(): Promise<Named[]> {
    return request<Named[]>(`${BASE}/categories`)
  },
  createCategory(name: string): Promise<Named> {
    return request<Named>(`${BASE}/categories`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },
  deleteCategory(id: number): Promise<void> {
    return request<void>(`${BASE}/categories/${id}`, { method: 'DELETE' })
  },
  listTags(): Promise<Named[]> {
    return request<Named[]>(`${BASE}/tags`)
  },
  createTag(name: string): Promise<Named> {
    return request<Named>(`${BASE}/tags`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },
  deleteTag(id: number): Promise<void> {
    return request<void>(`${BASE}/tags/${id}`, { method: 'DELETE' })
  },
}
