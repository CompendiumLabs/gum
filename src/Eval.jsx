// code evaluation

import * as Babel from '@babel/standalone'
import { KEYS, VALS, is_function, is_object, Svg } from '../lib/gum.js'

//
// tree parser
//

function parseTree(tree) {
  if (tree == null) return null
  if (typeof tree !== 'object') return tree
  let { tag: Tag, props, children } = tree
  if (Array.isArray(children)) {
      children = children.map(parseTree)
  } else if (children != null) {
      children = [ parseTree(children) ]
  }
  return new Tag({ children, ...props })
}

//
// jsx parser
//

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

function h(tag, props, ...children) {
  const flattened = children.length > 0 ? flattenChildren(children) : null
  return { tag, props, children: flattened }
}

function parseJSX(code) {
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

function evaluateGum(code) {
  // parse to property tree
  const tree = parseJSX(code)

  // check if its actually a tree
  if (!is_object(tree)) {
      return `Return value:\n\n${tree}`
  }

  // parse to gum element
  let element = parseTree(tree)

  // wrap it in Svg if not already
  if (!(element instanceof Svg)) {
      element = new Svg({ children: [ element ] })
  }

  // render to string
  const svg = element.svg()
  const div = <div dangerouslySetInnerHTML={{ __html: svg }} />
  console.log(div)

  // return the element
  return [ div, null ]
}

//
// export
//

export { evaluateGum }
