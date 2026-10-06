import { useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { LibraryPage } from '@/pages/LibraryPage'
import { SnippetDetailPage } from '@/pages/SnippetDetailPage'
import { SnippetEditorPage } from '@/pages/SnippetEditorPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { TaxonomyPage } from '@/pages/TaxonomyPage'

const SIDEBAR_STORAGE_KEY = 'vibebox.sidebar.collapsed'

function App() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true',
  )

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        onNewSnippet={() => navigate('/snippets/new')}
      />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/snippets/new" element={<SnippetEditorPage />} />
          <Route path="/snippets/:id" element={<SnippetDetailPage />} />
          <Route path="/snippets/:id/edit" element={<SnippetEditorPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/taxonomy" element={<TaxonomyPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
