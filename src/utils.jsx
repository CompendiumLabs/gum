// utility functions

import { useRef, useState, useEffect, useLayoutEffect } from 'react'

//
// ui sizing
//

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
// doc cache
//

function getFileTag(path) {
  const file_name = path.split('/').pop()
  const file_tag = file_name.split('.').shift()
  return file_tag
}

function useManCache() {
  const [ cache, setCache ] = useState(null)

  useEffect(() => {
    const loadMan = async () => {
      // enumerate files
      const textModules = import.meta.glob('../man/text/*.md', {
        query: '?raw',
        import: 'default',
      })
      const codeModules = import.meta.glob('../man/code/*.jsx', {
        query: '?raw',
        import: 'default',
      })

      // fetch files
      const textEntries = await Promise.all(Object.entries(textModules).map(
        async ([path, importFn]) => [ getFileTag(path), await importFn() ]
      ))
      const codeEntries = await Promise.all(Object.entries(codeModules).map(
        async ([path, importFn]) => [ getFileTag(path), await importFn() ]
      ))

      // set maps
      setCache({
        text: new Map(textEntries),
        code: new Map(codeEntries),
      })
    }
    loadMan()
  }, [])

  return cache
}

//
// font cache
//

function useFontData(fontUrl) {
  const [fontData, setFontData] = useState(null);

  useEffect(() => {
    const loadFont = async () => {
      const response = await fetch(fontUrl);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      setFontData(uint8Array);
    };
    loadFont();
  }, []);

  return fontData;
}

//
// local storage
//

function initFromStorage(key, value, loader) {
  const json = localStorage.getItem(key)
  const data = json ? JSON.parse(json) : value
  return loader ? loader(data) : data
}

function useLocalStorage(key, defaultState = null, loader = null) {
  // load from localStorage
  const [state, setState] = useState(() => initFromStorage(key, defaultState, loader))

  // on state change, save to localStorage
  useEffect(() => {
    try {
      const data = JSON.stringify(state)
      window.localStorage.setItem(key, data)
    } catch (error) {
      console.error('Failed to save state to localStorage:', error)
    }
  }, [state, key])

  // return state saver
  return [ state, setState ]
}

//
// export
//

export { useElementSize, useManCache, useFontData, useLocalStorage, initFromStorage }
