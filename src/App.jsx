// GUM.JSX

import { useRef, useState, useEffect } from 'react'
import { evaluateGumSafe } from './Eval'
import { CodeEditor } from './Editor'
import { ErrorCatcher } from './Error'
import { useElementSize } from './utils'

import './App.css'
import './fonts.css'

//
// app
//

const DEFAULT_CODE = `
const xlim = [0, 2*pi]
return <Frame fill margin={0.2}>
  <Plot grid ylim={[-1.5, 1.5]} xlabel="Phase (radians)" ylabel="Interference" title="Flux Capacitance">
    <SymFill fy1={sin} fy2={cos} xlim={xlim} fill={blue} opacity={0.5} />
    <SymPath fy={sin} xlim={xlim} />
    <SymPath fy={cos} xlim={xlim} />
  </Plot>
</Frame>
`.trim() + '\n'

export default function App() {
  const outerRef = useRef(null)
  const editorRef = useRef(null)
  const [ key, setKey ] = useState(0)
  const [ canvasRef, canvasSize ] = useElementSize()

  const [ code, setCode ] = useState(DEFAULT_CODE)
  const [ element, setElement ] = useState(null)
  const [ error, setError ] = useState(null)
  const [ zoom, setZoom ] = useState(60)

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

  // render full screen
  return <div ref={outerRef} className="w-screen h-screen p-5 bg-gray-100" onWheel={handleZoom}>
    <div className="w-full h-full flex flex-col gap-5">
      <div className="w-full h-[30%] flex flex-row gap-5">
        <div className="w-[55%] h-full flex border rounded-md border-gray-500">
          <CodeEditor editorRef={editorRef} className="h-full" code={code} setCode={handleCode} />
        </div>
        <div className="w-[45%] h-full flex">
          <div className="w-full h-full flex flex-col">
            <div className="w-full flex flex-row cursor-default select-none">
              <div className="flex-1 p-2 border border-b-0 border-gray-500 rounded-t-md font-mono smallcaps bg-white">
                Status — { error ? <span className="text-red-500">Error</span> : <span className="text-green-700">Success</span> }
              </div>
              <div className="w-[100px] p-2 font-mono text-center text-gray-700">GUM.JSX</div>
            </div>
            <div className="w-full flex-1 p-2 border rounded-tr-md rounded-b-md border-gray-500 overflow-auto bg-white">
              {error && <div className="whitespace-pre-wrap font-mono text-sm">{error}</div>}
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
