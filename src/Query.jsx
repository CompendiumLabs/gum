// generation

import { useState } from 'react'
import { stream, reply } from 'oneping'

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
  let { provider, base_url, chat_model } = settings
  provider = provider ?? 'oneping'
  if (provider == 'oneping') {
    chat_model = chat_model ?? ONEPING_MODEL
    base_url = base_url ?? ONEPING_URL
    return { provider, base_url, chat_model }
  } else if (provider == 'local') {
    return { provider }
  } else {
    const api_key = settings[provider]
    if (api_key == null) {
      throw new Error(`Must specify API key for ${provider}`)
    }
    return chat_model ? { provider, api_key, chat_model } : { provider, api_key }
  }
}

//
// generation
//

async function generate(query, { settings, system, code, error, history, setCode, setHistory, setMessage }) {
  setMessage('Generating response...')

  try {
    // make query params
    const { diff_type } = settings
    const provider = getProvider(settings)
    const prompt = makePrompt(query, { code, error, diff_type })

    // log prompt
    console.log('PROMPT:')
    console.log(prompt)

    // execute request
    let text = ''
    if (code.length == 0) {
      const tokens = stream(prompt, { ...provider, system, history })
      for await (const chunk of tokens) {
        text += chunk
        console.log(`CHUNK: ${chunk}`)
        setCode(text)
      }
    } else {
      text = await reply(prompt, { ...provider, system, history })
    }

    // handle empty response
    if (text == null) {
      throw new Error('No response from LLM')
    }

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

  setMessage(null)
}

// query interface

function QueryBox({ ref, query, setQuery, generating, message, onSubmit }) {
  // handle key down
  async function handleKeyDown(event) {
    if (event.key == 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (query.length == 0) return
      await onSubmit()
      setQuery('')
    }
  }

  // handle change
  function handleChange(event) {
    setQuery(event.target.value)
  }

  // render
  const className = generating ? 'bg-gray-100' : ''
  return <div className="relative w-full h-full flex flex-col items-center justify-center">
    <textarea ref={ref} className={`w-full h-full outline-none resize-none font-mono text-sm p-4 ${className}`} placeholder="Enter your query here..." value={query} onChange={handleChange} onKeyDown={handleKeyDown} disabled={generating} />
    { message && <div className="absolute border rounded-md p-2 bg-white select-none">{message}</div> }
    { query && !generating && <div className="absolute bottom-0 right-0 p-2">
      <div className="m-2 px-2 py-1 border border-gray-500 rounded cursor-pointer hover:bg-gray-200" onClick={onSubmit}>RUN</div>
    </div>}
  </div>
}

//
// export
//

export { generate, QueryBox }
