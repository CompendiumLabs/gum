// code evaluation

import { KEYS, VALS, is_scalar, is_function, is_object, Svg } from './gum.js'

// if in node import babel
if (typeof Babel == 'undefined') {
  var Babel = await import('@babel/standalone')
}

//
// jsx parser
//

// check if a function or class
function isClass(func) {
  return typeof func === 'function' &&
         func.prototype &&
         func.prototype.constructor === func &&
         Object.getOwnPropertyDescriptor(func, 'prototype').writable === false
}

// recursively flatten all children, including nested arrays
function flattenChildren(items) {
  const result = []
  for (const item of items) {
      if (Array.isArray(item)) {
          result.push(...flattenChildren(item))
      } else if (item != null && item !== false && item !== true) {
          if (typeof item === 'string' && item.trim() === '') continue
          result.push(item)
      }
  }
  return result
}

function convertKebab(props) {
  return (props != null) ? Object.fromEntries(
    Object.entries(props).map(
      ([ k, v ]) => [ k.replace(/-/g, '_'), v ]
    )
  ) : {}
}

function h(tag, props, ...children) {
  const flattened = children.length > 0 ? flattenChildren(children) : null
  const props1 = { children: flattened, ...convertKebab(props) }
  return isClass(tag) ? new tag(props1) : tag(props1)
}

function parseJSX(code) {
  // strip comment lines
  code = code.replace(/^\s*\/\/.*\n/gm, '').trim()

  // wrap code in a function if it's not an element
  const wrappedCode = /^\s*</.test(code) ? code : `function run() { ${code} }`

  // plugin based approach
  const react_jsx = [ 'transform-react-jsx', { pragma: 'h' } ]
  const { code: transformed } = Babel.transform(wrappedCode, { plugins: [ react_jsx ] })

  // run that baby
  const runnable = `return ${transformed}`
  const executor = new Function('h', ...KEYS, runnable)
  const result = executor(h, ...VALS)

  // if its a function then run it
  return is_function(result) ? result() : result
}

//
// gum evaluator
//

class MessageError extends Error {
  constructor(message) {
    super(message)
    this.name = 'MessageError'
  }
}

function evaluateGum(code, { size = 500 } = {}) {
  if (code.trim() == '') {
    throw new MessageError(`No code provided`)
  }

  // parse to property tree
  let element = parseJSX(code)

  // check if its actually a tree
  if (!is_object(element)) {
    if (element == null) {
      throw new MessageError(`No return value`)
    } else {
      throw new MessageError(`Return value:\n\n${element}`)
    }
  }

  // wrap it in Svg if not already
  if (!(element instanceof Svg)) {
    let args = { size }
    if (!is_scalar(size)) {
      const [ width, height ] = size
      args.width = width
      args.height = height
    }
    element = new Svg({ children: element, ...args })
  }

  // return element
  return element
}

function evaluateGumSafe(code, { size: size0 } = {}) {
  let svg, size, error = null
  try {
    const elem = evaluateGum(code, { size: size0 })
    svg = elem.svg()
    size = elem.size
  } catch (err) {
    const { message } = err
    if (err instanceof MessageError) {
      error = message
    } else {
      const trace = err.stack.split('\n').slice(1).join('\n')
      error = `${message}\n\n${trace}`
    }
  }

  // return results
  return { svg, error, size }
}

//
// export
//

export { evaluateGum, evaluateGumSafe }
