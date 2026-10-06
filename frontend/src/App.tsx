import { Route, Routes, useNavigate } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { LibraryPage } from '@/pages/LibraryPage'
import { SnippetDetailPage } from '@/pages/SnippetDetailPage'
import { SnippetEditorPage } from '@/pages/SnippetEditorPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { TaxonomyPage } from '@/pages/TaxonomyPage'

function App() {
  const navigate = useNavigate()
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar onNewSnippet={() => navigate('/snippets/new')} />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/snippets/new" element={<SnippetEditorPage />} />
          <Route path="/snippets/:id" element={<SnippetDetailPage />} />
          <Route path="/snippets/:id/edit" element={<SnippetEditorPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/taxonomy" element={<TaxonomyPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
