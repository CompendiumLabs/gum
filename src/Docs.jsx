// docs

import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'

import { ErrorCatcher } from './Error'
import { CodeEditor } from './Editor'
import { useElementSize } from './utils'
import { evaluateGumSafe } from './Eval'

import { Text, HStack, Svg } from '../lib/gum.js'

import './Docs.css'

import meta from '../docs/meta.json?3'

function Panel({ children, className }) {
  return <div className={`border rounded-md border-gray-500 bg-white ${className}`}>
    {children}
  </div>
}

function ClickList({ children }) {
  return <div className="w-full h-full flex flex-col gap-1">
    {children}
  </div>
}

function ClickItem({ children, onClick }) {
  return <div className={`cursor-pointer select-none hover:bg-slate-300 border-l-5 border-transparent hover:border-l-5 hover:border-blue-500 p-2`} onClick={onClick}>
    {children}
  </div>
}

function makeGumLogo() {
  const runes = [...'GUM'].map(r => new Text({ children: r }))
  const text = new HStack({ children: runes, spacing: 0.4 })
  const svg = new Svg({ children: text, size: 200, aspect: 2.8 })
  return svg.svg()
}

function GumLogo() {
  return <div className="w-full h-full flex justify-center items-center">
    <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: makeGumLogo() }} />
  </div>
}

function splitCode(code) {
  if (code.startsWith('//')) {
    code = code.split('\n').slice(1).join('\n')
  }
  return code.trim() + '\n'
}

// build document cache
function usePage(meta, page) {
  const [ text, setText ] = useState('')
  const [ code, setCode ] = useState('')
  useEffect(() => {
    async function fetchDocs() {
      // fetch documentation text
      const res_text = await fetch(`../docs/text/${page}.md?raw`)
      const val_text = await res_text.text()
      setText(val_text)

      // fetch code example
      const res_code = await fetch(`../docs/code/${page}.jsx?raw`)
      const val_code = await res_code.text()
      setCode(val_code)
    }
    fetchDocs()
  }, [meta, page])
  return { text, code, setCode }
}

export default function Docs() {
  // page loading and navigation
  const { page = 'gum' } = useParams()
  const navigate = useNavigate()
  const { text, code, setCode } = usePage(meta, page)

  // code editor setup
  const [ key, setKey ] = useState(0)
  const [ element, setElement ] = useState(null)
  const [ error, setError ] = useState(null)
  const [ canvasRef, canvasSize ] = useElementSize()

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
    const code1 = splitCode(code)
    const size = canvasSize ?? [ 500, 500 ]
    const [ newElement, newError ] = evaluateGumSafe(code1, size)
    if (newElement) setElement(newElement)
    setError(newError)
  }, [ code, canvasSize ])

  // handle sidebar clicks
  function handleClick(name) {
    navigate(`/docs/${name.toLowerCase()}`)
  }

  function handleMarkdownLink({ href, children }) {
    return <a className="cursor-pointer" onClick={e => {
      e.preventDefault()
      if (href.startsWith('/docs/')) {
        navigate(href)
      } else {
        window.open(href, '_blank')
      }
    }}>{children}</a>
  }

  return <div className="w-screen h-screen p-5 bg-gray-100">
    <div className="w-full h-full flex flex-row gap-5">
      <Panel className="h-full w-[55%] flex flex-row">
        <div className="h-full w-[150px] flex flex-col border-r rounded-l border-gray-500 bg-slate-200 overflow-y-auto pt-2">
          <ClickList>
            <div className="cursor-pointer select-none border rounded px-2 m-3 hover:bg-slate-300 hover:border-blue-500" onClick={() => handleClick('')}>
              <GumLogo />
            </div>
            {Object.entries(meta).map(([ key, value ]) => <>
              <div key={key} className="pl-2 font-mono smallcaps text-sm text-slate-600 select-none">{key}</div>
              {value.map((item, index) =>
                <ClickItem key={index} onClick={() => handleClick(item)}>{item}</ClickItem>
              )}
            </>)}
          </ClickList>
        </div>
        <div className="h-full flex-1 p-5 overflow-y-auto prose max-w-none text-md">
          <ReactMarkdown components={{ a: handleMarkdownLink }}>{text}</ReactMarkdown>
        </div>
      </Panel>
      <div className="h-full flex flex-col gap-5 w-[45%]">
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
