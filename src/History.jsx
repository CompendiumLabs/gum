// history

import { useState, useEffect } from 'react'
import { useElementSize } from './utils'
import { evaluateGumSafe } from './Eval'

function CodePreview({ code }) {
  const [ preview, setPreview ] = useState(true)
  const [ canvasRef, canvasSize ] = useElementSize()
  const [ element, setElement ] = useState(null)
  const [ error, setError ] = useState(null)

  // eval code for element render
  useEffect(() => {
    const size = canvasSize ?? [ 500, 500 ]
    const [ newElement, newError ] = evaluateGumSafe(code, size)
    if (newElement) setElement(newElement)
    setError(newError)
  }, [ code, canvasSize ])

  return <div ref={canvasRef} className="relative w-full h-full">
    { preview && <div className="w-full h-64">{element}</div> }
    { !preview && <div className="whitespace-pre-wrap font-mono text-sm">{code}</div> }
    <div className="absolute top-2 right-2 border rounded-sm text-xs flex flex-row cursor-pointer">
      <div className={`rounded-l-sm p-1 ${preview ? 'bg-black text-white' : ''}`} onClick={() => setPreview(true)}>Image</div>
      <div className={`rounded-r-sm p-1 ${!preview ? 'bg-black text-white' : ''}`} onClick={() => setPreview(false)}>Code</div>
    </div>
  </div>
}

function Message({ role, content }) {
  const roleCol = role == 'user' ? 'text-blue-500' : 'text-red-500'
  return <div className="flex flex-col gap-2 text-sm pb-4">
    <div className={`font-bold ${roleCol}`}>{role}</div>
    <div className="border rounded-sm border-gray-500 p-2 whitespace-pre-wrap">
      {role == 'assistant' ? <CodePreview code={content} /> : content}
    </div>
  </div>
}

function History({ history }) {
  return <div className="w-full h-full flex flex-col gap-4 p-4">
    {history.map((h, i) => <Message key={i} {...h} />)}
</div>
}

export { History }
