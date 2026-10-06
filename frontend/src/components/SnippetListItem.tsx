import { useNavigate } from 'react-router-dom'
import { Component, FileCode2, FolderGit2 } from 'lucide-react'
import type { Snippet } from '@/lib/api'
import { Badge } from '@/components/ui/badge'

export function SnippetListItem({ snippet }: { snippet: Snippet }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/snippets/${snippet.id}`)}
      className="group flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
    >
      <FileCode2 className="size-5 shrink-0 text-primary" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold leading-tight">{snippet.title}</h3>
          <Badge variant="secondary" className="shrink-0 gap-1 text-[10px]">
            {snippet.type === 'MODULE' ? (
              <FolderGit2 className="size-3" />
            ) : (
              <Component className="size-3" />
            )}
            {snippet.type === 'MODULE' ? 'Module' : 'Component'}
          </Badge>
        </div>
        {snippet.description && (
          <p className="truncate text-sm text-muted-foreground">{snippet.description}</p>
        )}
      </div>

      <div className="hidden shrink-0 flex-wrap items-center justify-end gap-1.5 sm:flex sm:max-w-[40%]">
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
  )
}
