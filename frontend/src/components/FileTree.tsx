import { useMemo, useState } from 'react'
import { useSandpack } from '@codesandbox/sandpack-react'
import {
  ChevronDown,
  ChevronRight,
  File as FileIcon,
  Folder,
  FolderOpen,
  Star,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileTreeProps {
  paths: string[]
  entryFile?: string
  editable?: boolean
  onSetEntry?: (path: string) => void
  onRemove?: (path: string) => void
  height?: number
}

interface TreeNode {
  name: string
  path: string
  isFile: boolean
  children: TreeNode[]
}

function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode = { name: '', path: '', isFile: false, children: [] }
  for (const full of paths) {
    const parts = full.split('/').filter(Boolean)
    let cursor = root
    let acc = ''
    parts.forEach((part, idx) => {
      acc += `/${part}`
      const isFile = idx === parts.length - 1
      let child = cursor.children.find((c) => c.name === part && c.isFile === isFile)
      if (!child) {
        child = { name: part, path: acc, isFile, children: [] }
        cursor.children.push(child)
      }
      cursor = child
    })
  }
  sortNodes(root)
  return root.children
}

function sortNodes(node: TreeNode) {
  node.children.sort((a, b) => {
    if (a.isFile !== b.isFile) return a.isFile ? 1 : -1
    return a.name.localeCompare(b.name)
  })
  node.children.forEach(sortNodes)
}

export function FileTree({
  paths,
  entryFile,
  editable = false,
  onSetEntry,
  onRemove,
  height = 440,
}: FileTreeProps) {
  const { sandpack } = useSandpack()
  const tree = useMemo(() => buildTree(paths), [paths])
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggleFolder = (path: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const renderNodes = (nodes: TreeNode[], depth: number) =>
    nodes.map((node) => {
      const indent = { paddingLeft: depth * 12 + 8 }
      if (!node.isFile) {
        const isOpen = !collapsed.has(node.path)
        return (
          <div key={node.path}>
            <button
              type="button"
              onClick={() => toggleFolder(node.path)}
              style={indent}
              className="flex w-full items-center gap-1 py-1 pr-2 text-left text-xs text-foreground hover:bg-muted"
            >
              {isOpen ? (
                <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
              )}
              {isOpen ? (
                <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
              ) : (
                <Folder className="size-3.5 shrink-0 text-muted-foreground" />
              )}
              <span className="truncate font-medium">{node.name}</span>
            </button>
            {isOpen && renderNodes(node.children, depth + 1)}
          </div>
        )
      }

      const isActive = sandpack.activeFile === node.path
      const isEntry = entryFile === node.path
      return (
        <div
          key={node.path}
          style={indent}
          className={cn(
            'group flex items-center gap-1 py-1 pr-2 text-xs',
            isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted',
          )}
        >
          <ChevronRight className="invisible size-3 shrink-0" />
          <button
            type="button"
            onClick={() => sandpack.setActiveFile(node.path)}
            className="flex min-w-0 flex-1 items-center gap-1 text-left"
          >
            <FileIcon className="size-3.5 shrink-0" />
            <span className="truncate font-mono">{node.name}</span>
          </button>
          {editable && (
            <>
              <button
                type="button"
                title={isEntry ? 'Entry file' : 'Set as entry file'}
                onClick={() => onSetEntry?.(node.path)}
                className={cn(
                  'shrink-0 opacity-0 transition-opacity group-hover:opacity-100',
                  isEntry && 'opacity-100',
                )}
              >
                <Star className={cn('size-3', isEntry && 'fill-primary text-primary')} />
              </button>
              {paths.length > 1 && (
                <button
                  type="button"
                  title="Remove file"
                  onClick={() => onRemove?.(node.path)}
                  className="shrink-0 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="size-3" />
                </button>
              )}
            </>
          )}
        </div>
      )
    })

  return (
    <div
      className="w-56 shrink-0 overflow-auto border-r border-border bg-card py-1"
      style={{ height }}
    >
      {renderNodes(tree, 0)}
    </div>
  )
}
