// GUM.JSX

import { useRef, useState, useEffect } from 'react'
import { evaluateGum } from './Eval'
import { CodeEditor } from './Editor'
import { ErrorCatcher } from './Error'

import './App.css'
import './fonts.css'

//
// app
//

const DEFAULT_CODE = `
<Frame margin={0.3}>
  <Plot grid ylim={[-1.5, 1.5]} xlabel="Phase (radians)" title="Hello World!">
    <SymFill fy1={sin} fy2={cos} xlim={[0, 2*pi]} fill={blue+"99"} />
  </Plot>
</Frame>
`.trim() + '\n'

export default function App() {
  const outerRef = useRef(null)
  const editorRef = useRef(null)
  const canvasRef = useRef(null)
  const [ key, setKey ] = useState(0)

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
    const [ newElement, newError ] = evaluateGum(code)
    if (newElement) setElement(newElement)
    setError(newError)
  }, [ code ])

  // set width directly using style
  const canvasStyle = {
    width: `${zoom}%`,
    height: `${zoom}%`,
  }

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
          <div style={canvasStyle}>
            <ErrorCatcher key={key} onError={handleError}>{element}</ErrorCatcher>
          </div>
        </div>
      </div>
    </div>
  </div>
}
