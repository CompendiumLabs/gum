// GUM.JSX

import { useRef, useState, useEffect } from 'react'
import { useElementSize, useLocalStorage } from './utils'
import { evaluateGumSafe } from './Eval'
import { useSystem } from './prompt'
import { generate } from './query'
import { ErrorCatcher } from './Error'
import { CodeEditor } from './Editor'
import { Settings } from './Settings'

import './App.css'
import './fonts.css'

//
// widgets
//

function TabBar({ children, selected, setSelected }) {
  return <div className="w-fit flex flex-row">
    {children.map(child => {
      const tab = child.props ? child.props.tab : child.toLowerCase()
      const className = selected == tab ? 'bg-white' : 'bg-gray-100'
      return <div key={tab} className={`w-[100px] flex justify-center items-center px-4 border border-r-0 border-b-0 border-gray-500 first:rounded-tl-md last:rounded-tr-md last:border-r font-mono smallcaps cursor-pointer hover:font-bold ${className}`} onClick={() => setSelected(tab)}>
        {child}
      </div>
    })}
  </div>
}

function QueryBox({ ref, onSubmit }) {
  const [ query, setQuery ] = useState('')
  const [ active, setActive ] = useState(true)

  // handle key down
  async function handleKeyDown(event) {
    if (event.key == 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (onSubmit) {
        setActive(false)
        await onSubmit(query)
        setActive(true)
      }
      setQuery('')
    }
  }

  // handle change
  function handleChange(event) {
    setQuery(event.target.value)
  }

  // render
  const activeClass = active ? '' : 'bg-gray-100'
  return <div className="w-full h-full flex flex-col">
    <textarea ref={ref} className={`w-full h-full outline-none font-mono text-sm p-4 ${activeClass}`} placeholder="Enter your query here..." value={query} onChange={handleChange} onKeyDown={handleKeyDown} />
  </div>
}

//
// app
//

const DEFAULT_CODE = `
<Frame fill margin={0.25}>
  <Plot grid ylim={[-1.5, 1.5]} xlabel="Phase (radians)" ylabel="Interference" title="Flux Capacitance">
    <SymFill fy1={sin} fy2={cos} xlim={[0, 2*pi]} fill={blue} opacity={0.5} />
    <SymPath fy={sin} xlim={[0, 2*pi]} />
    <SymPath fy={cos} xlim={[0, 2*pi]} />
  </Plot>
</Frame>
`.trim() + '\n'

const DEFAULT_SETTINGS = {
  diff_type: 'none',
}

export default function App() {
  // ui refs
  const outerRef = useRef(null)
  const editorRef = useRef(null)
  const queryRef = useRef(null)
  const [ canvasRef, canvasSize ] = useElementSize()

  // code state
  const [ key, setKey ] = useState(0)
  const [ element, setElement ] = useState(null)
  const [ error, setError ] = useState(null)

  // generation state
  const system = useSystem()

  // settings state
  const [ settings, setSettings ] = useLocalStorage('gum-settings', DEFAULT_SETTINGS)
  const [ code, setCode ] = useLocalStorage('gum-code', DEFAULT_CODE)
  const [ tab, setTab ] = useLocalStorage('gum-tab', 'query')
  const [ zoom, setZoom ] = useLocalStorage('gum-zoom', 60)

  // handle scroll zoom
  function handleZoom(event) {
    const { target, deltaY } = event
    if (target != canvasRef.current) return
    const factor = deltaY < 0 ? 1.2 : 1/1.2
    const newZoom = Math.max(10, Math.min(90, zoom * factor))
    setZoom(newZoom)
  }

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
    // get adjusted size
    const [ width, height ] = canvasSize ?? [ 500, 500 ]
    const size = [ zoom * width / 100, zoom * height / 100 ]

    // send to evaluator
    const [ newElement, newError ] = evaluateGumSafe(code, size)
    if (newElement) setElement(newElement)
    setError(newError)
  }, [ code, zoom, canvasSize ])

  // handle query submit
  async function handleQuery(query) {
    const result = await generate(query, { settings, system, setCode })
    if (result != null) handleCode(result)
  }

  // focus query box on startup
  useEffect(() => {
    if (tab == 'query') {
      if (queryRef.current) queryRef.current.focus()
    }
  }, [tab])

  // render full screen
  return <div ref={outerRef} className="w-screen h-screen p-5 bg-gray-100" onWheel={handleZoom}>
    <div className="w-full h-full flex flex-col gap-5">
      <div className="w-full h-[30%] flex flex-row gap-5">
        <div className="w-[55%] h-full flex border rounded-md border-gray-500">
          <CodeEditor editorRef={editorRef} className="h-full" code={code} setCode={handleCode} />
        </div>
        <div className="w-[45%] h-full flex">
          <div className="w-full h-full flex flex-col">
            <div className="w-full flex flex-row gap-2 cursor-default select-none">
              <TabBar selected={tab} setSelected={setTab}>
                {"Query"}
                <span tab="status" className={error ? "text-red-500" : "text-green-700"}>Status</span>
                {"Settings"}
              </TabBar>
              <div className="flex-1" />
              <div className="my-1 mr-1 p-1 px-3 font-mono border rounded border-gray-500 hover:bg-gray-200 cursor-pointer" onClick={() => window.open('/docs', '_blank') }>?</div>
            </div>
            <div className="w-full flex-1 flex flex-col items-center border rounded-tr-md rounded-b-md border-gray-500 overflow-auto bg-white">
              {tab == "query" && <QueryBox ref={queryRef} onSubmit={handleQuery} />}
              {tab == "status" && <div className="w-full h-full whitespace-pre-wrap font-mono text-sm p-4">{error ?? "All good!"}</div>}
              {tab == "settings" && <Settings settings={settings} setSettings={setSettings} />}
            </div>
          </div>
        </div>
      </div>
      <div ref={canvasRef} className="w-full flex-1">
        <div className="w-full h-full flex justify-center items-center border rounded-md border-gray-500 bg-white pointer-events-none select-none">
          <ErrorCatcher key={key} onError={handleError}>{element}</ErrorCatcher>
        </div>
      </div>
    </div>
  </div>
}
