// docs

import { useState, useEffect, useMemo } from 'react'
import { marked } from 'marked'

import { ErrorCatcher } from './Error'
import { CodeEditor } from './Editor'
import { useElementSize } from './utils'
import { evaluateGumSafe } from './Eval'

import meta from '../docs/meta.json'

function Panel({ children, className }) {
  return <div className={`border rounded-md border-gray-500 bg-white ${className}`}>
    {children}
  </div>
}

function ClickList({ children, onClick }) {
  return <div className="w-full h-full flex flex-col gap-1">
    {children}
  </div>
}

function ClickItem({ name, onClick }) {
  return <div className="cursor-pointer select-none hover:bg-slate-300 border-l-5 border-transparent hover:border-l-5 hover:border-blue-500 p-2" onClick={onClick}>
    {name}
  </div>
}

// build document cache
function useDocCache(meta) {
  const [ cache, setCache ] = useState({})
  useEffect(() => {
    async function fetchDocs() {
      const docs = {}
      const keys = Object.values(meta).flat()
        .map(item => item.toLowerCase())
      for (const key of keys) {
        const res_text = await fetch(`/docs/text/${key}.md?raw`)
        const res_code = await fetch(`/docs/code/${key}.jsx?raw`)
        const text = await res_text.text()
        const code = await res_code.text()
        docs[`${key}.md`] = text
        docs[`${key}.jsx`] = code
      }
      setCache(docs)
    }
    fetchDocs()
  }, [meta])
  return cache
}

export default function Docs({}) {
  const [ key, setKey ] = useState(0)
  const [ element, setElement ] = useState(null)
  const [ error, setError ] = useState(null)
  const [ doc, setDoc ] = useState(null)
  const [ code, setCode ] = useState('')
  const [ canvasRef, canvasSize ] = useElementSize()
  const docCache = useDocCache(meta)

  // handle code updates
  function handleCode(c) {
    setCode(c)
    setKey(key + 1)
  }

  // intercept wildcat errors
  function handleError(error, errorInfo) {
    setError(error.message + '\n' + errorInfo.componentStack)
  }

  // eval code for element render
  useEffect(() => {
    const size = canvasSize ?? [ 500, 500 ]
    const [ newElement, newError ] = evaluateGumSafe(code, size)
    if (newElement) setElement(newElement)
    setError(newError)
  }, [ code, canvasSize ])

  // handle sidebar clicks
  function handleClick(name) {
    const key = name.toLowerCase()
    setDoc(docCache[`${key}.md`])
    setCode(docCache[`${key}.jsx`])
  }

  // render markdown
  const docHtml = useMemo(() => {
    if (!doc) return null
    return marked.parse(doc)
  }, [ doc ])

  return <div className="w-screen h-screen p-5 bg-gray-100">
    <div className="w-full h-full flex flex-row gap-5">
      <Panel className="h-full w-[53%] flex flex-row">
        <div className="h-full w-[150px] flex flex-col border-r rounded-l border-gray-500 bg-slate-200 overflow-y-auto pt-2">
          <ClickList>
            {Object.entries(meta).map(([ key, value ]) => <>
              <div key={key} className="pl-2 font-mono smallcaps text-sm text-slate-600 select-none">{key}</div>
              {value.map((item, index) =>
                <ClickItem key={index} name={item} onClick={() => handleClick(item)} />
              )}
            </>)}
          </ClickList>
        </div>
        <div className="h-full flex-1 p-5 overflow-y-auto prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: docHtml }} />
        </div>
      </Panel>
      <div className="h-full flex flex-col gap-5 w-[47%]">
        <Panel className="w-full flex-1 flex">
          <CodeEditor className="h-full" code={code} setCode={handleCode} />
        </Panel>
        <Panel ref={canvasRef} className="w-full h-[50%]">
          <div className="w-full h-full flex justify-center items-center pointer-events-none select-none rounded-md">
            <ErrorCatcher key={key} onError={handleError}>{element}</ErrorCatcher>
          </div>
        </Panel>
      </div>
    </div>
  </div>
}
