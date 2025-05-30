// jsx interface

import { KEYS, VALS } from './gum.js'

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

function parseTree(tree) {
    if (tree == null) return null
    if (typeof tree !== 'object') return tree
    let { tag: Tag, props, children } = tree
    if (Array.isArray(children)) {
        children = children.map(parseTree)
    } else if (children != null) {
        children = [parseTree(children)]
    }
    return new Tag({ children, ...props })
}

function parseJSX(code) {
    // plugin based approach
    const react_jsx = ['transform-react-jsx', { pragma: 'h' }]
    const { code: transformed } = babel.transform(code, { plugins: [ react_jsx ] })

    // run that baby
    const runnable = `return ${transformed}`
    const executor = new Function('h', ...KEYS, runnable)
    return executor(h, ...VALS)
}

function evaluateJSX(code) {
    const tree = parseJSX(code)
    return parseTree(tree)
}

//
// exports
//

export { evaluateJSX }