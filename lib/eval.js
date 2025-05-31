// eval interface

import { KEYS, VALS, is_function, is_object, is_element, Svg } from './gum.js'

//
// gum parser
//

// main parser entry
function parseGum(src, extra) {
    extra = extra ?? []
    const keys = extra.map(g => g.name)
    const gums = [ ...KEYS, ...keys ]
    const mako = [ ...VALS, ...extra ]
    const expr = new Function(gums, src)
    return expr(...mako)
}

function renderElem(elem, args) {
    if (is_element(elem)) {
        elem = (elem instanceof Svg) ? elem : new Svg({ children: [ elem ], ...args })
        return elem.svg()
    } else {
        return String(elem)
    }
}

function renderGum(src, args) {
    const elem = parseGum(src)
    return renderElem(elem, args)
}

function renderGumSafe(src, args) {
    // parse gum into element
    let elem
    try {
        elem = parseGum(src)
    } catch (err) {
        throw new Error(`parse error, line ${err.lineNumber}: ${err.message}\n${err.stack}`)
    }

    // check for null
    if (elem == null) {
        throw new Error('no data. does your code return an element?')
    }

    // render element to svg
    let svg
    try {
        svg = renderElem(elem, args)
    } catch (err) {
        throw new Error(`render error, line ${err.lineNumber}: ${err.message}\n${err.stack}`)
    }

    // success
    return svg
}

//
// image injection
//

function parseHTML(str) {
    const tmp = document.implementation.createHTMLDocument('')
    tmp.body.innerHTML = str
    return tmp.body.children[0]
}

// image injection for static viewing
function injectImage(img) {
    const src = img.getAttribute('src')
    const request = new XMLHttpRequest()
    request.open('GET', src, true)
    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            const cls = img.classList
            const alt = img.getAttribute('alt')
            const svg = parseHTML(this.response)
            svg.classList = cls
            svg.setAttribute('alt', alt)
            img.parentNode.replaceChild(svg, img)
        }
    }
    request.send()
}

function injectScript(scr) {
    const src = scr.innerText
    const width = scr.getAttribute('width')
    const size = string_to_int(scr.getAttribute('size'))
    const svg = renderGum(src, { size: size })
    const elem = parseHTML(svg)
    if (width != null) {
        elem.style.width = width
        elem.style.display = 'block'
        elem.style.margin = 'auto'
    }
    scr.replaceWith(elem)
}

function injectScripts(elem) {
    elem = elem ?? document
    elem.querySelectorAll('script').forEach(scr => {
        if (scr.getAttribute('type') == 'text/gum') {
            injectScript(scr)
        }
    })
}

function injectImages(elem) {
    elem = elem ?? document
    elem.querySelectorAll('img').forEach(img => {
        if (img.classList.contains('gum')) {
            injectImage(img)
        }
    })
}

//
// exports
//

export { evaluateJSX, parseGum, renderElem, renderGum, renderGumSafe, parseHTML, injectImage, injectImages, injectScripts }
