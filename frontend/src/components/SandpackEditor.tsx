import { useMemo } from 'react'
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from '@codesandbox/sandpack-react'
import type { SandpackFiles } from '@codesandbox/sandpack-react'
import type { SnippetFile } from '@/lib/api'
import { useTheme } from '@/theme/theme-context'

interface SandpackEditorProps {
  files: SnippetFile[]
  entryFile: string
  dependencies: string
  showEditor?: boolean
  showTabs?: boolean
  editorHeight?: number
}

function parseDependencies(raw: string): Record<string, string> {
  try {
    const parsed = JSON.parse(raw || '{}')
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string>
    }
  } catch {
    /* ignore malformed JSON */
  }
  return {}
}

export function SandpackEditor({
  files,
  entryFile,
  dependencies,
  showEditor = true,
  showTabs = true,
  editorHeight = 420,
}: SandpackEditorProps) {
  const { mode } = useTheme()

  const sandpackFiles = useMemo<SandpackFiles>(() => {
    const map: SandpackFiles = {}
    for (const f of files) {
      map[f.path] = { code: f.code }
    }
    if (Object.keys(map).length === 0) {
      map['/App.js'] = { code: 'export default () => <div>Empty snippet</div>\n' }
    }
    return map
  }, [files])

  const deps = useMemo(() => parseDependencies(dependencies), [dependencies])

  const activeFile = sandpackFiles[entryFile] ? entryFile : Object.keys(sandpackFiles)[0]

  return (
    <SandpackProvider
      key={`${mode}-${activeFile}-${files.length}`}
      template="react"
      theme={mode}
      files={sandpackFiles}
      customSetup={{ dependencies: deps }}
      options={{ activeFile }}
    >
      <SandpackLayout>
        {showEditor && (
          <SandpackCodeEditor
            showTabs={showTabs}
            showLineNumbers
            showInlineErrors
            wrapContent
            style={{ height: editorHeight }}
          />
        )}
        <SandpackPreview
          showNavigator={false}
          showOpenInCodeSandbox={false}
          showRefreshButton
          style={{ height: editorHeight }}
        />
      </SandpackLayout>
    </SandpackProvider>
  )
}
