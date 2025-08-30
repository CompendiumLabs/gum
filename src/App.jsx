// GUM.JSX

import { useRef, useState, useEffect } from 'react'
import { useElementSize, useLocalStorage } from './utils'
import { useSystem } from './prompt'
import { generate, QueryBox } from './Query'
import { Canvas } from './Canvas'
import { CodeEditor } from './Editor'
import { History } from './History'
import { Settings } from './Settings'
import { svgToPng } from './render'

import { evaluateGum, evaluateGumSafe } from '../lib/eval.js'

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
  provider: 'oneping',
  chat_model: 'google/gemini-2.5-flash-lite',
  diff_type: 'block',
}

export default function App() {
  // ui refs
  const outerRef = useRef(null)
  const editorRef = useRef(null)
  const queryRef = useRef(null)
  const [ canvasRef, canvasSize ] = useElementSize()

  // code state
  const [ version, setVersion ] = useState(0)
  const [ element, setElement ] = useState(null)
  const [ size, setSize ] = useState(null)
  const [ error, setError ] = useState(null)
  const [ image, setImage ] = useState(null)

  // generation state
  const system = useSystem()
  const [ query, setQuery ] = useState('')
  const [ history, setHistory ] = useState([])
  const [ generating, setGenerating ] = useState(false)
  const [ message, setMessage ] = useState(null)

  // settings state
  const [ settings, setSettings ] = useLocalStorage('gum-settings', DEFAULT_SETTINGS)
  const [ code, setCode ] = useLocalStorage('gum-code', DEFAULT_CODE)
  const [ tab, setTab ] = useLocalStorage('gum-tab', 'query')
  const [ zoom, setZoom ] = useLocalStorage('gum-zoom', 60)

  // handle code updates
  function handleCode(c) {
    if (generating || c == null) return
    setCode(c)
    setVersion(version + 1)
  }

  // focus query box
  function focusQuery() {
    if (tab == 'query' && queryRef.current) queryRef.current.focus()
  }

  // handle query submit
  async function handleQuery() {
    setGenerating(true)
    const result = await generate(query, { settings, system, code, image, error, history, setCode, setHistory, setMessage })
    setGenerating(false)
    setImage(null)
    focusQuery()
    if (result != null) handleCode(result)
  }

  // handle fix button
  async function handleFix() {
    setQuery('Fix the error in the code.')
    setTab('query')
    focusQuery()
    await handleQuery()
    setQuery('')
  }

  // handle image
  async function handleImage(set) {
    if (error) return
    if (set) {
      const img = await svgToPng(element, { size, blob: true })
      setImage(img)
    } else {
      setImage(null)
    }
  }

  // eval code for element render
  useEffect(() => {
    // get adjusted size
    const [ width, height ] = canvasSize ?? [ 500, 500 ]
    const zsize = [ (zoom / 100) * width, (zoom / 100) * height ]

    // send to evaluator
    const { svg: newElement, error: newError, size: newSize } = evaluateGumSafe(code, { size: zsize })
    if (newElement) setElement(newElement)
    if (newSize) setSize(newSize)
    setError(newError)
  }, [ code, zoom, canvasSize ])

  // focus query box on startup
  useEffect(() => {
    focusQuery()
  }, [tab])

  // render full screen
  return <div ref={outerRef} className="w-screen h-screen p-5 bg-gray-100">
    <div className="w-full h-full flex flex-col gap-5">
      <div className="w-full h-[35%] flex flex-row gap-5">
        <div className="w-[55%] h-full flex border rounded-md border-gray-500">
          <CodeEditor editorRef={editorRef} className="h-full rounded-md" code={code} setCode={handleCode} disabled={generating} />
        </div>
        <div className="w-[45%] h-full flex">
          <div className="w-full h-full flex flex-col">
            <div className="w-full flex flex-row gap-2 cursor-default select-none">
              <TabBar selected={tab} setSelected={setTab}>
                {"Query"}
                <span tab="status" className={error ? "text-red-500" : "text-green-700"}>Status</span>
                {"History"}
                {"Settings"}
              </TabBar>
              <div className="flex-1" />
              <div className="my-1 mr-1 p-1 px-3 font-mono border rounded border-gray-500 hover:bg-gray-200 cursor-pointer" onClick={() => window.open('docs', '_blank') }>?</div>
            </div>
            <div className="w-full flex-1 flex flex-col items-center border rounded-tr-md rounded-b-md border-gray-500 overflow-auto bg-white">
              {tab == "query" && <QueryBox ref={queryRef} query={query} setQuery={setQuery} generating={generating} message={message} onSubmit={handleQuery} image={image} setImage={handleImage} />}
              {tab == "status" && <div className="relative w-full h-full">
                <div className="h-full p-4 whitespace-pre-wrap font-mono text-sm overflow-scroll">{error ?? "All good!"}</div>
                {error && <div className="absolute bottom-0 right-0 p-2">
                  <div className="m-2 px-2 py-1 border border-gray-500 rounded cursor-pointer bg-white hover:bg-gray-200" onClick={handleFix}>FIX</div>
                </div>}
              </div>}
              {tab == "history" && <History history={history} />}
              {tab == "settings" && <Settings settings={settings} setSettings={setSettings} />}
            </div>
          </div>
        </div>
      </div>
      <Canvas canvasRef={canvasRef} element={element} size={size} setError={setError} zoom={zoom} setZoom={setZoom} version={version} />
    </div>
  </div>
}
