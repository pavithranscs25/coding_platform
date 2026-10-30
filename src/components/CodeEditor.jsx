import Editor from '@monaco-editor/react'
export default function CodeEditor({ language, value, onChange }) {
  return (<Editor height="100%" theme="vs-dark" language={language} value={value} onChange={(v) => onChange(v ?? '')}
    options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: 'on', autoIndent: 'full', matchBrackets: 'always', automaticLayout: true, scrollBeyondLastLine: false, tabSize: 4, padding: { top: 12 } }} />)
}
