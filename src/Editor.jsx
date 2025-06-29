// codemirror

import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'

const extensions = [ javascript({ jsx: true }), EditorView.lineWrapping ]

const basicSetup = {
  lineNumbers: true,
  foldGutter: false,
  indentOnInput: false,
  highlightActiveLine: true,
  highlightActiveLineGutter: false,
  autocompletion: false,
}

function CodeEditor({ editorRef, className, code, setCode }) {
  return <CodeMirror
    ref={editorRef}
    className={className}
    width="100%"
    height="100%"
    basicSetup={basicSetup}
    extensions={extensions}
    value={code}
    onChange={setCode}
  />
}

export { CodeEditor }
