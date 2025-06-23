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

function useDocCache() {
  const [ cache, setCache ] = useState(null)

  useEffect(() => {
    const loadDocs = async () => {
      // enumerate files
      const textModules = import.meta.glob('../docs/text/*.md', {
        query: '?raw',
        import: 'default',
      })
      const codeModules = import.meta.glob('../docs/code/*.jsx', {
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
    loadDocs()
  }, [])

  return cache
}

//
// local storage
//

function usePeriodicLocalStorage(key, state, storer = null, intervalMs = 5000) {
  // use a ref to track the latest state without causing effect reruns
  const stateRef = useRef(state);

  // update ref whenever state changes
  useEffect(() => {
      stateRef.current = state;
  }, [state]);

  // save to localStorage
  function saveToStorage() {
      try {
          const data = storer ? storer(stateRef.current) : stateRef.current
          window.localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
          console.error('Failed to save state to localStorage:', error);
      }
  }

  // save to localStorage on interval
  useEffect(() => {
      const intervalId = setInterval(saveToStorage, intervalMs);
      return () => clearInterval(intervalId);
  }, [key, intervalMs]);

  // return state saver
  return saveToStorage
}

function initFromStorage(key, value, loader) {
  const json = localStorage.getItem(key)
  const data = json ? JSON.parse(json) : value
  return loader ? loader(data) : data
}

//
// export
//

export { useElementSize, useDocCache, usePeriodicLocalStorage, initFromStorage }
