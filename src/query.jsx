// generation

import { reply } from 'oneping'

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

async function generate(query, { settings, system, setCode }) {
  try {
    // make query params
    const provider = getProvider(settings)
    const prompt = makePrompt(query)

    // log prompt
    console.log('PROMPT:')
    console.log(prompt)

    // execute request
    const text = await reply(prompt, { ...provider, system })

    // log text
    console.log('TEXT:')
    console.log(text)

    // extract code from response
    const { lang, code } = extractCode(text)

    // log code
    console.log(`CODE (${lang}):`)
    console.log(code)

    // update state / history
    setCode(code)
  } catch (error) {
    console.error('Error generating code:', error)
    console.log(error.message)
  }
}

//
// export
//

export { generate }
