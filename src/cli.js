// cli testing

import * as Babel from '@babel/core'

//
// phony gum setup
//

function filterObject(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value != null)
    )
}

class Element {
    constructor({ tag, unary = false, ...props }) {
        if (tag == null) throw new Error('tag is required')
        this.tag = tag
        this.unary = unary
        this.attr = filterObject(props)
    }

    props() {
        return Object.entries(this.attr).map(
            ([key, value]) => `${key}="${value}"`
        ).join(' ')
    }

    inner() {
        return this.children.map(child => child.render()).join('\n')
    }

    render() {
        const props = this.props()
        const pstr = props.length > 0 ? ` ${props}` : ''
        return this.unary ?
            `<${this.tag}${pstr} />` :
            `<${this.tag}${pstr}>\n${this.inner()}\n</${this.tag}>`
    }
}


class Group extends Element {
    constructor({ children = [], ...props }) {
        super({ tag: 'g', ...props })
        this.children = children
    }
}

class Svg extends Group {
    constructor({ ...props }) {
        super({ tag: 'svg', ...props })
    }
}

class Rect extends Element {
    constructor({ ...props }) {
        super({ tag: 'rect', unary: true, ...props })
    }
}

class Text extends Element {
    constructor({ children, ...props }) {
        super({ tag: 'text', ...props })
        this.text = children
    }

    inner() {
        return this.text
    }

    render() {
        const props = this.props()
        const pstr = props.length > 0 ? ` ${props}` : ''
        return `<${this.tag}${pstr}>${this.inner()}</${this.tag}>`
    }
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

function h(tag, props, ...children) {
    const flattened = children.length > 0 ? flattenChildren(children) : null
    return { tag, props, children: flattened }
}

function create(tree) {
    if (tree == null) return null
    if (typeof tree !== 'object') return tree
    let { tag: Tag, props, children } = tree
    if (Array.isArray(children)) {
        children = children.map(create)
    } else if (children != null) {
        children = [create(children)]
    }
    return new Tag({ children, ...props })
}

const KEYS = ['Element', 'Group', 'Svg', 'Rect', 'Text']
const VALS = [Element, Group, Svg, Rect, Text]

function evaluate(code) {
    // plugin based approach
    const plugins = [
        ['@babel/plugin-transform-react-jsx', { pragma: 'h' }],
    ]
    const { code: transformed } = Babel.transformSync(code, { plugins })

    // run that baby
    const runnable = `return ${transformed}`
    const executor = new Function('h', ...KEYS, runnable)
    return executor(h, ...VALS)
}

// testing JSX code
const code = `
<Svg>
    <Group> {[1, 2, 3].map(x =>
        <Text x={x*10} y={10} font-size={12}>{x}</Text>
    )} </Group>
    <Rect x={10} y={10} width={100} height={100} />
</Svg>
`.trim()
console.log('CODE:')
console.log(code)

// convert to javascript
const result = evaluate(code)
console.log('RESULT:')
console.log(result.children[0].children[0])

// create element tree
const tree = create(result)
console.log('TREE:')
console.log(tree.children[0].children[0])

// render to SVG
const svg = tree.render()
console.log('SVG:')
console.log(svg)
