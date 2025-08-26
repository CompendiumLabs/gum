// svg canvas

import { ErrorCatcher } from './Error'
import { ExportSvgIcon, ExportPngIcon } from './icons'
import { downloadSvg, downloadPng, svgToPng } from './render'
import { useFontData } from './utils'

import ibmPlexSans from '../lib/fonts/IBMPlexSans-Regular.ttf?url'
import ibmPlexMono from '../lib/fonts/IBMPlexMono-Regular.ttf?url'

function Canvas({ canvasRef, element, size, setError, zoom, setZoom, version }) {
  const sansFont = useFontData(ibmPlexSans)
  const monoFont = useFontData(ibmPlexMono)

  // handle scroll zoom
  function handleZoom(event) {
    const { deltaY } = event
    const factor = deltaY < 0 ? 1.2 : 1 / 1.2
    const newZoom = Math.max(10, Math.min(90, zoom * factor))
    setZoom(newZoom)
  }

  // intercept wildcat errors
  function handleError(error, errorInfo) {
    const { message } = error
    setError(message)
  }

  // handle export svg
  function handleExportSvg() {
    downloadSvg(element)
  }

  // handle export png
  async function handleExportPng() {
    const png = await svgToPng(element, { size, blob: true })
    downloadPng(png)
  }

  return <div ref={canvasRef} className="w-full flex-1" onWheel={handleZoom}>
    <div className="relative w-full h-full flex justify-center items-center border rounded-md border-gray-500 bg-white select-none">
      <ErrorCatcher key={version} onError={handleError}>
        <div dangerouslySetInnerHTML={{ __html: element }} className="pointer-events-none" />
      </ErrorCatcher>
      <div className="absolute bottom-0 right-0 m-4 flex flex-row border border-gray-500 rounded-sm cursor-pointer bg-white">
        <div className="w-10 h-8 flex justify-center items-center hover:bg-gray-200 rounded-l" onClick={handleExportSvg}>
          <ExportSvgIcon />
        </div>
        <div className="w-10 h-8 flex justify-center items-center hover:bg-gray-200 border-l border-gray-500 rounded-r" onClick={handleExportPng}>
          <ExportPngIcon />
        </div>
      </div>
    </div>
  </div>
}

export { Canvas }
