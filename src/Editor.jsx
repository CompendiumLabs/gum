// codemirror

import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'

const noSelection = EditorView.theme({
  '&': { backgroundColor: '#f5f5f5' },
  '.cm-content': { backgroundColor: '#f5f5f5' },
  '.cm-editor': { backgroundColor: '#f5f5f5' },
  '.cm-focused': { backgroundColor: '#f5f5f5' },
  '.cm-gutter': { backgroundColor: '#f5f5f5' },
})

const defaultExtensions = [ javascript({ jsx: true }), EditorView.lineWrapping ]

function CodeEditor({ editorRef, className, code, setCode, disabled }) {
  const extensions = disabled ? [ ...defaultExtensions, noSelection ] : defaultExtensions
  const basicSetup = {
    lineNumbers: true,
    foldGutter: false,
    indentOnInput: false,
    highlightActiveLine: !disabled,
    highlightActiveLineGutter: false,
    autocompletion: false,
  }
  return <CodeMirror
    ref={editorRef}
    className={className}
    width="100%"
    height="100%"
    basicSetup={basicSetup}
    extensions={extensions}
    value={code}
    onChange={setCode}
    editable={!disabled}
    readOnly={disabled}
  />
}

export { CodeEditor }
