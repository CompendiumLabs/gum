// code evaluation

import * as Babel from '@babel/standalone'
import { KEYS, VALS, is_function, is_object, Svg } from '../lib/gum.js'

//
// tree parser
//

function parseTree(tree) {
  // handle special cases
  if (tree == null) return null
  if (typeof tree !== 'object') return tree
  let { tag: Tag, props, children } = tree

  // convert kebab case to lower-kebab case
  props = (props != null) ? Object.fromEntries(
    Object.entries(props).map(
      ([ k, v ]) => [ k.replace(/-/g, '_'), v ]
    )
  ) : {}

  // parse children
  if (Array.isArray(children)) {
      children = children.map(parseTree)
  } else if (children != null) {
      children = [ parseTree(children) ]
  }

  // return the element
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

function evaluateGum(code, size) {
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
    const [ width, height ] = size
    element = new Svg({ children: [ element ], width, height })
  }

  // render to string
  const svg = element.svg()

  // return the element
  return svg
}

function evaluateGumSafe(code, size) {
  size ??= [ 500, 500 ]

  // give it a shot
  let svg, error = null
  try {
    svg = evaluateGum(code, size)
  } catch (e) {
    const trace = e.stack.split('\n').slice(1).join('\n')
    error = `${e.message}\n\n${trace}`
  }

  // wrap the svg in a div
  const div = <div className="flex w-full h-full justify-center items-center" dangerouslySetInnerHTML={{ __html: svg }} />

  // return results
  return [ div, error ]
}

//
// export
//

export { evaluateGum, evaluateGumSafe }
