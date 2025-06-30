// generation

import { useState } from 'react'
import { reply } from 'oneping'

import { applyDiff } from './patch'
import { makePrompt, extractCode } from './prompt'

//
// llm provider
//

// ONEPING SETUP
// python -m oneping router --allow-origins="['https://beta.compendiumlabs.ai', 'https://compendiumlabs.ai']"
const ONEPING_URL = import.meta.env.DEV ? 'http://localhost:5000' : 'https://beta.compendiumlabs.ai'
const ONEPING_MODEL = 'google/gemini-2.0-flash-exp'

function getProvider(settings) {
  let { provider, base_url, model } = settings
  provider = provider ?? 'oneping'
  if (provider == 'oneping') {
    model = model ?? ONEPING_MODEL
    base_url = base_url ?? ONEPING_URL
    return { provider, model, base_url }
  } else {
    const api_key = settings[provider]
    if (api_key == null) {
      throw new Error(`Must specify API key for ${provider}`)
    }
    return model ? { provider, model, api_key } : { provider, api_key }
  }
}

//
// generation
//

async function generate(query, { settings, system, code, error, history, setCode, setHistory }) {
  try {
    // make query params
    const { diff_type } = settings
    const provider = getProvider(settings)
    const prompt = makePrompt(query, { code, error, diff_type })

    // log prompt
    console.log('PROMPT:')
    console.log(prompt)

    // execute request
    const text = await reply(prompt, { ...provider, system, history })

    // log text
    console.log('TEXT:')
    console.log(text)

    // extract code from response
    const { lang, code: diff } = extractCode(text)

    // log diff
    console.log(`DIFF (${lang}):`)
    console.log(diff)

    // apply diff if needed
    const code1 = (lang == 'diff') ? applyDiff(diff, code, { diff_type }) : diff

    // log code
    console.log(`CODE:`)
    console.log(code1)

    // update history
    setHistory([
      ...history,
      { role: 'user', content: query },
      { role: 'assistant', content: code1 },
    ])

    // set new code
    setCode(code1)
  } catch (error) {
    console.error('Error generating code:', error)
    console.log(error.message)
  }
}

// query interface

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
    <textarea ref={ref} className={`w-full h-full outline-none resize-none font-mono text-sm p-4 ${activeClass}`} placeholder="Enter your query here..." value={query} onChange={handleChange} onKeyDown={handleKeyDown} disabled={!active} />
  </div>
}

//
// export
//

export { generate, QueryBox }
