// generation

import { stream, reply } from 'oneping'

import { applyDiff } from './patch'
import { makePrompt, extractCode } from './prompt'
import { urlToData } from './render'

import cameraIcon from './icons/camera.svg'

//
// llm provider
//

const MAX_TOKENS = 8192

// ONEPING SETUP
// python -m oneping router --allow-origins="['https://beta.compendiumlabs.ai', 'https://compendiumlabs.ai']"
const ONEPING_URL = import.meta.env.DEV ? 'http://localhost:5000' : 'https://beta.compendiumlabs.ai'
const ONEPING_MODEL = 'google/gemini-2.5-flash'

function getProvider(settings) {
  let { provider, base_url, chat_model } = settings
  provider = provider ?? 'oneping'
  let args = { provider }
  if (provider == 'oneping') {
    args.base_url = base_url ?? ONEPING_URL
    args.chat_model = chat_model ?? ONEPING_MODEL
  } else if (provider != 'local') {
    const api_key = settings[provider]
    if (api_key == null) {
      throw new Error(`Must specify API key for ${provider}`)
    }
    args.api_key = api_key
    if (chat_model) {
      args.chat_model = chat_model
    }
  }
  if (provider == 'anthropic') {
    args.max_tokens = MAX_TOKENS
  }
  return args
}

//
// generation
//

async function generate(query, { settings, system, code, image, error, history, setCode, setHistory, setMessage }) {
  setMessage('Generating response...')

  try {
    // make query params
    const { diff_type } = settings
    const provider = getProvider(settings)

    // make image
    const has_image = image != null
    const imgdata = image ? await urlToData(image) : null

    // make prompt
    const prompt = makePrompt(query, { code, error, diff_type, has_image })

    // log prompt
    console.log('PROMPT:')
    console.log(prompt)

    // execute request
    let text = ''
    if (code.length == 0) {
      const tokens = stream(prompt, { ...provider, system, history, image: imgdata })
      for await (const chunk of tokens) {
        text += chunk
        // console.log(`CHUNK: ${chunk}`)
        const { code: code1 } = extractCode(text)
        setCode(code1)
      }
    } else {
      text = await reply(prompt, { ...provider, system, history, image: imgdata })
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

function QueryBox({ ref, query, setQuery, generating, message, onSubmit, image, setImage }) {
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
    <div className="absolute bottom-0 right-0 p-3">
      <div className="p-2 rounded cursor-pointer hover:bg-gray-200" onClick={() => setImage(image == null)}>
        { image ? <img src={image} alt="Snapshot" className="max-w-16 max-h-16 border border-gray-300" /> : <img src={cameraIcon} alt="Take snapshot" className="w-4 h-4" /> }
      </div>
    </div>
  </div>
}

//
// export
//

export { generate, QueryBox }
