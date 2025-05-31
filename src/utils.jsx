// utility functions

import { useRef, useState, useLayoutEffect } from 'react'

// track html parent element size
function useElementSize() {
  const elementRef = useRef(null)
  const [ size, setSize ] = useState(null)
  useLayoutEffect(() => {
    if (elementRef.current == null) return

    function updateSize() {
      const { width, height } = elementRef.current.getBoundingClientRect()
      setSize([ width, height ])
    }

    // listen for size changes
    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)

    // hook up resize observer
    resizeObserver.observe(elementRef.current)
    return () => resizeObserver.disconnect()
  }, [])
  return [ elementRef, size ]
}

//
// export
//

export { useElementSize }
