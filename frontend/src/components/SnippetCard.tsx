import { useNavigate } from 'react-router-dom'
import { Component, FileCode2, FolderGit2 } from 'lucide-react'
import type { Snippet } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

function excerpt(snippet: Snippet): string {
  const entry =
    snippet.files.find((f) => f.path === snippet.entryFile) ?? snippet.files[0]
  const code = entry?.code ?? ''
  return code.split('\n').slice(0, 8).join('\n')
}

export function SnippetCard({ snippet }: { snippet: Snippet }) {
  const navigate = useNavigate()

  return (
    <Card
      onClick={() => navigate(`/snippets/${snippet.id}`)}
      className="group flex cursor-pointer flex-col overflow-hidden transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="relative h-32 overflow-hidden border-b border-border bg-muted/40">
        <pre className="h-full overflow-hidden p-3 font-mono text-[10px] leading-snug text-muted-foreground">
          {excerpt(snippet)}
        </pre>
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent" />
        <Badge
          variant="secondary"
          className="absolute right-2 top-2 gap-1 text-[10px]"
        >
          {snippet.type === 'MODULE' ? (
            <FolderGit2 className="size-3" />
          ) : (
            <Component className="size-3" />
          )}
          {snippet.type === 'MODULE' ? 'Module' : 'Component'}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <FileCode2 className="size-4 shrink-0 text-primary" />
          <h3 className="truncate font-semibold leading-tight">{snippet.title}</h3>
        </div>
        {snippet.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {snippet.description}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          {snippet.categoryName && (
            <Badge variant="outline" className="text-[10px]">
              {snippet.categoryName}
            </Badge>
          )}
          {snippet.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} className="text-[10px]">
              {tag}
            </Badge>
          ))}
          {snippet.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{snippet.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
