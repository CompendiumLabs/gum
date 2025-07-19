// settings pane

import { useState, useEffect } from 'react'

//
// settings widgets
//

function maskKey(key) {
  return (key != null) ? '*'.repeat(key.length) : ''
}

function TextRow({ name, secret, placeholder, value, setValue }) {
  const [inputValue, setInputValue] = useState('')

  const isStored = value != null
  const isMasked = (secret ?? true) && isStored

  useEffect(() => {
    setInputValue(value ?? '')
  }, [value])

  function handleStore() {
    if (isStored) {
      setInputValue('')
      setValue(null)
    } else {
      setValue(inputValue)
    }
  }

  function handleKeyDown(e) {
    e.stopPropagation()
    if (e.key == 'Enter') {
      handleStore()
    }
  }

  return <div className="flex flex-row w-full">
    <div className="flex min-w-[100px] items-center justify-center">{name}</div>
    <div className="flex flex-row flex-1 border border-black rounded-sm overflow-x-scroll">
      <input
        disabled={isStored}
        value={isMasked ? maskKey(inputValue) : inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={e => handleKeyDown(e)}
        className="flex-1 p-1 rounded-l-sm font-mono overflow-x-scroll [scrollbar-width:none] outline-none"
        placeholder={placeholder ?? ''}
      />
      <button onClick={handleStore} className="min-w-[100px] bg-black text-white font-bold p-1 cursor-pointer hover:bg-gray-800">
        {isStored ? 'Unset' : 'Set'}
      </button>
    </div>
  </div>
}

function ToggleRow({ name, options, value, setValue }) {
  return <div className="flex flex-row">
    <div className="flex min-w-[100px] items-center justify-center">{name}</div>
    <div className="flex flex-row items-center border border-black rounded-sm overflow-x-scroll">
      {options.map((opt, i) => {
        const optLower = opt.toLowerCase()
        const selected = optLower == value
        const bgCol = selected ? 'bg-black' : 'bg-white'
        const textCol = selected ? 'text-white' : 'text-black'
        const borderCol = selected ? 'border-black' : 'border-gray-600'
        const hoverCol = selected ? '' : 'hover:bg-gray-200'
        return <button key={opt} onClick={() => setValue(optLower)} className={`min-w-[100px] ${bgCol} ${textCol} font-bold p-1 border-r last:border-r-0 ${borderCol} ${hoverCol} cursor-pointer`}>
          {opt}
        </button>
      })}
    </div>
  </div>
}

//
// settings pane
//

function Settings({ settings, setSettings }) {
  function handleStore(key, value) {
    setSettings(set => ({ ...set, [key]: value }))
  }

  return <div className="w-[80%] flex flex-col gap-4 m-4 text-sm">
    <div className="font-bold text-center">Models</div>
    <TextRow name="PROVIDER" key="provider" secret={false} placeholder="anthropic, openai, google" value={settings.provider} setValue={v => handleStore('provider', v)} />
    <TextRow name="MODEL" key="chat_model" secret={false} placeholder="claude-3-7-sonnet, gpt-4o, gemini-2.0-flash-exp" value={settings.chat_model} setValue={v => handleStore('chat_model', v)} />
    <TextRow name="URL" key="url" secret={false} placeholder="beta.compendiumlabs.ai/chat" value={settings.base_url} setValue={v => handleStore('base_url', v)} />
    <div></div>
    <div className="font-bold text-center">API Keys</div>
    <TextRow name="ANTHROPIC" key="anthropic" placeholder="Anthropic API Key" value={settings.anthropic} setValue={v => handleStore('anthropic', v)} />
    <TextRow name="OPENAI" key="openai" placeholder="OpenAI API Key" value={settings.openai} setValue={v => handleStore('openai', v)} />
    <TextRow name="GOOGLE" key="google" placeholder="Google API Key" value={settings.google} setValue={v => handleStore('google', v)} />
    <TextRow name="XAI" key="xai" placeholder="XAI API Key" value={settings.xai} setValue={v => handleStore('xai', v)} />
    <div></div>
    <div className="font-bold text-center">Generation</div>
    <ToggleRow name="DIFF TYPE" key="diff_type" options={['None', 'Unified', 'Block']} value={settings.diff_type} setValue={v => handleStore('diff_type', v)} />
    <div className="min-h-[10px]"></div>
  </div>
}

//
// export
//

export { Settings }
