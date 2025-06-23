// generation

import { useMemo, useState, useEffect } from 'react'

//
// prompt
//

import meta from '../docs/meta.json?json'
import prompt from '../gen/prompt.md?raw'
import docs from '../gen/docs.md?raw'
import diff from '../gen/diff_block.md?raw'
import launch from '../gen/launch.md?raw'

// replace links with bold and push headings
function prepareText(text) {
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '**$1**')
  text = text.replace(/^# (.*?)$/gm, '## $1')
  return text.trim()
}

// if there's a comment on line one, that's the query
function prepareCode(text) {
  const [ first, ...rest ] = text.split('\n')
  const query = first.replace(/^\/\/(.*?)$/, '$1').trim()
  const code = `\`\`\`jsx\n${rest.join('\n').trim()}\n\`\`\``
  return `**Example**\n\nQUERY: ${query}\n\nRESPONSE:\n\n${code}`
}

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

// generate docs for all pages
function useSystem() {
  const cache = useDocCache()

  // load docs async
  return useMemo(() => {
    // wait until cache is loaded
    if (!cache) return null

    // construct system promot
    const pageList = Object.values(meta).flat()
    const pages = pageList.map(page => {
      const tag = page.toLowerCase()
      const text_raw = cache.text.get(tag)
      const code_raw = cache.code.get(tag)
      const text = prepareText(text_raw)
      const code = prepareCode(code_raw)
      return `${text}\n\n${code}`
    })

    // make system prompt
    return `${prompt.trim()}\n\n${docs.trim()}\n\n${pages.join('\n\n')}\n\n${diff.trim()}\n\n${launch.trim()}`
  }, [ cache ])
}

//
// generation
//

async function generate(query, system) {
  console.log(system)
  await new Promise(resolve => setTimeout(resolve, 1000))
}

//
// export
//

export { generate, useDocCache, useSystem }
