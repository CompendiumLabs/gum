// gum.js

import { emoji_table } from './emoji.js'

//
// defaults
//

// namespace
const svgns = 'http://www.w3.org/2000/svg'

// defaults
const outer_base = 500
const rect_base = [ 0, 0, 1, 1 ]
const coord_base = [ 0, 0, 1, 1 ]
const lim_base = [ 0, 1 ]
const prec_base = 2
const N_base = 100

// fonts
const font_family_base = 'IBMPlexSans'
const font_weight_base = 100
const font_size_base = 12

// boolean defaults
const rounded_true = 0.05
const margin_true = 0.1
const padding_true = 0.1
const spacing_true = 0.1

// plot defaults
const num_ticks_base = 5
const tick_size_base = 0.075
const tick_label_size_base = 1.2
const tick_label_offset_base = 0.5
const label_size_base = 0.07
const label_offset_base = [ 0.13, 0.18 ]
const title_size_base = 0.14
const title_offset_base = 0.07

// default styling
const svg_attr_base = {
    stroke: 'black',
    fill: 'none',
    font_family: font_family_base,
    font_weight: font_weight_base,
}

// canvas text sizer
function canvas_text_sizer(ctx, text, {
    family = font_family_base, weight = font_weight_base, size = font_size_base, actual = false
} = {}) {
    ctx.font = `${weight} ${size}px ${family}`
    const met = ctx.measureText(text)
    return actual ? [
        -met.actualBoundingBoxLeft,
        -met.actualBoundingBoxDescent,
        met.actualBoundingBoxRight,
        met.actualBoundingBoxAscent
    ] : [
        0, 0, met.width, size
    ]
}

// try for browser environment
let text_sizer = null
try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    text_sizer = function(text, args) {
        return canvas_text_sizer(ctx, text, args)
    }
} catch (error) {
    // console.log(error)
}

//
// array utils
//

function* gzip(...iterables) {
    if (iterables.length == 0) {
        return
    }
    const iterators = iterables.map(i => i[Symbol.iterator]())
    while (true) {
        const results = iterators.map(iter => iter.next())
        if (results.some(res => res.done)) {
            return
        } else {
            yield results.map(res => res.value)
        }
    }
}

function zip(...iterables) {
    return [...gzip(...iterables)]
}

function reshape(arr, shape) {
    const [n, m] = shape
    const ret = []
    for (let i = 0; i < n; i++) {
        ret.push(arr.slice(i*m, (i+1)*m))
    }
    return ret
}

function split(arr, len) {
    const n = Math.ceil(arr.length / len)
    return reshape(arr, [n, len])
}

function concat(arrs) {
    return arrs.flat()
}

//
// array reducers
//

function sum(arr) {
    arr = arr.filter(v => v != null)
    return arr.reduce((a, b) => a + b, 0)
}

function prod(arr) {
    arr = arr.filter(v => v != null)
    return arr.reduce((a, b) => a * b, 1)
}

function mean(arr) {
    return sum(arr)/arr.length
}

function all(arr) {
    return arr.reduce((a, b) => a && b)
}

function any(arr) {
    return arr.reduce((a, b) => a || b)
}

// vector ops

function broadcast_tuple(x, y) {
    const xa = is_array(x)
    const ya = is_array(y)
    if (xa == ya) return [ x, y ]
    if (!xa) x = [ x, x, x, x ]
    if (!ya) y = [ y, y, y, y ]
    return [ x, y ]
}

function broadcastFunc(f) {
    return (x0, y0) => {
        const [ x, y] = broadcast_tuple(x0, y0)
        if (is_scalar(x) && is_scalar(y)) return f(x, y)
        else return zip(x, y).map(([ a, b ]) => f(a, b))
    }
}

function add(x, y) {
    return broadcastFunc((a, b) => a + b)(x, y)
}
function sub(x, y) {
    return broadcastFunc((a, b) => a - b)(x, y)
}
function mul(x, y) {
    return broadcastFunc((a, b) => a * b)(x, y)
}
function div(x, y) {
    return broadcastFunc((a, b) => a / b)(x, y)
}

//
// array ops
//

function cumsum(arr, first) {
    const sum = 0
    const ret = arr.map(x => sum += x)
    return (first ?? true) ? [ 0, ...ret.slice(0, -1) ] : ret
}

function norm(vals, degree) {
    degree = degree ?? 1
    return sum(vals.map(v => v**degree))**(1 / degree)
}

function normalize(vals, degree) {
    degree = degree ?? 1
    const mag = norm(vals, degree)
    return (mag == 0) ? vals.map(v => 0) : vals.map(v => v / mag)
}

//
// array generators
//

function range(ia, ib, step) {
    step = step ?? 1
    const [ i0, i1 ] = (ib == null) ? [ 0, ia ] : [ ia, ib ]
    const n = floor((i1 - i0) / step)
    return [...Array(n).keys()].map(i => i0 + step * i)
}

function linspace(x0, x1, n) {
    if (n == 1) { return [ 0.5 * (x0 + x1) ] }
    const step = (x1 - x0) / (n - 1)
    return [...Array(n).keys()].map(i => x0 + step * i)
}

function enumerate(x) {
    const n = x.length
    const idx = range(n)
    return zip(idx, x)
}

function repeat(x, n) {
    return Array(n).fill(x)
}

function padvec(vec, len, val) {
    if (vec.length >= len) return vec
    const m = len - vec.length
    return [...vec, ...repeat(val, m)]
}

//
// array combinators
//

function meshgrid(x, y) {
    return x.flatMap(xi => y.map(yi => [ xi, yi ]))
}

function lingrid(xlim, ylim, N) {
    if (N >= 100) throw new Error('N is restricted to be less than 100')
    const [Nx, Ny] = ensure_vector(N, 2)
    const xgrid = linspace(...xlim, Nx)
    const ygrid = linspace(...ylim, Ny)
    return meshgrid(xgrid, ygrid)
}

//
// object utils
//

function map_object(obj, fn) {
    return Object.fromEntries(
        Object.entries(obj).map(([ k, v ]) => [ k, fn(k, v) ])
    )
}

function filter_object(obj, fn) {
    return Object.fromEntries(
        Object.entries(obj).filter(([ k, v ]) => fn(k, v))
    )
}

//
// type checks
//

function ensure_array(x) {
    return is_array(x) ? x : [ x ]
}

function ensure_vector(x, n) {
    if (!is_array(x)) {
        return range(n).map(i => x)
    } else {
        return x
    }
}

function ensure_singleton(x) {
    return is_array(x) ? x[0] : x
}

function ensure_element(x) {
    if (is_prototype(x)) {
        const { tag, props, children } = x
        return new tag({ ...props, children })
    } else if (is_element(x)) {
        return x
    } else {
        throw new Error(`Element required: ${x}`)
    }
}

function ensure_function(f) {
    if (is_function(f)) {
        return (...a) => ensure_element(f(...a))
    } else {
        return () => ensure_element(f)
    }
}

function is_scalar(x) {
    return (
        (typeof(x) == 'number') ||
        (typeof(x) == 'object' && (
            (x.constructor.name == 'Number') ||
            (x.constructor.name == 'NamedNumber')
        ))
    )
}

function is_string(x) {
    return typeof(x) == 'string'
}

function is_number(x) {
    return typeof(x) == 'number'
}

function is_object(x) {
    return typeof(x) == 'object'
}

function is_function(x) {
    return typeof(x) == 'function'
}

function is_array(x) {
    return Array.isArray(x)
}

function is_element(x) {
    return x instanceof Element
}

function is_metaelement(x) {
    return x instanceof MetaElement
}

function is_element_class(x) {
    return Element.prototype.isPrototypeOf(x.prototype)
}

function is_prototype(x) {
    return is_object(x) ? is_element_class(x.tag) : false
}

//
// core math
//

// to be used in functions
class NamedNumber extends Number {
    constructor(name, value) {
        super(value)
        this.name = name
    }
}

class NamedString extends String {
    constructor(name, value) {
        super(value)
        this.name = name
    }
}

// functions
const exp = Math.exp
const log = Math.log
const sin = Math.sin
const cos = Math.cos
const tan = Math.tan
const cot = x => 1 / tan(x)
const abs = Math.abs
const pow = Math.pow
const sqrt = Math.sqrt
const sign = Math.sign
const floor = Math.floor
const ceil = Math.ceil
const round = Math.round
const atan = Math.atan
const isNan = Number.isNaN
const isInf = x => !Number.isFinite(x)

// null on empty
function min(...vals) {
    vals = vals.filter(v => v != null)
    return (vals.length > 0) ? Math.min(...vals) : null
}
function max(...vals) {
    vals = vals.filter(v => v != null)
    return (vals.length > 0) ? Math.max(...vals) : null
}

function clamp(x, lim) {
    const [ lo, hi ] = lim
    return max(lo, min(x, hi))
}

function mask(x, lim) {
    const [ lo, hi ] = lim
    return (x >= lo && x <= hi) ? x : null
}

function rescale(x, lim) {
    const [ lo, hi ] = lim
    return (x - lo) / (hi - lo)
}

function sigmoid(x) {
    return 1 / (1 + exp(-x))
}

function logit(p) {
    return log(p / (1 - p))
}

function smoothstep(x, lim) {
    const [ lo, hi ] = lim ?? [ 0, 1 ]
    const t = clamp((x - lo) / (hi - lo), [ 0, 1 ])
    return t * t * (3 - 2 * t)
}

// constants
const e = new NamedNumber('e', Math.E)
const pi = new NamedNumber('pi', Math.PI)
const phi = new NamedNumber('phi', (1 + sqrt(5)) / 2)
const r2d = new NamedNumber('r2d', 180 / Math.PI)
const d2r = new NamedNumber('d2r', Math.PI / 180)
const none = new NamedString('none', 'none')
const blue = new NamedString('blue', '#1e88e5')
const red = new NamedString('red', '#ff0d57')
const green = new NamedString('green', '#4caf50')
const yellow = new NamedString('yellow', '#ffb300')
const purple = new NamedString('purple', '#9c27b0')
const gray = new NamedString('gray', '#f0f0f0')

//
// random number generation
//

const random = Math.random

function uniform(lo, hi) {
    return lo + (hi - lo)*random()
}

// Standard Normal variate using Box-Muller transform.
function normal(mean, stdv) {
    mean = mean ?? 0
    stdv = stdv ?? 1
    const [ u, v ] = [ 1 - random(), random() ]
    const [ r, t ] = [ sqrt(-2 * log(u)), 2 * pi * v ]
    const [ a, b ] = [ r * cos(t), r * sin(t) ]
    return [ a, b ].map(x => mean + stdv * x)
}

//
// padding utils
//

// convenience mapper for rectangle positions
function pos_rect(r) {
    if (r == null) {
        return coord_base
    } else if (is_scalar(r)) {
        return [ 0, 0, r, r ]
    } else if (r.length == 2) {
        const [ rx, ry ] = r
        return [ 0, 0, rx, ry ]
    } else {
        return r
    }
}

function pad_rect(p) {
    if (p == null) {
        return coord_base
    } else if (is_scalar(p)) {
        return [ p, p, p, p ]
    } else if (p.length == 2) {
        const [ px, py ] = p
        return [ px, py, px, py ]
    } else {
        return p
    }
}

// map padding/margin into internal boxes
function map_padmar(p, m, a) {
    const [ pl, pt, pr, pb ] = p
    const [ ml, mt, mr, mb ] = m
    const [ pw, ph ] = [ pl + 1 + pr, pt + 1 + pb ]
    const [ tw, th ] = [ ml + pw + mr, mt + ph + mb ]
    const crect = [ (ml + pl) / tw, (mt + pt) / th, 1 - (mr + pr) / tw, 1 - (mb + pb) / th ]
    const brect = [ ml / tw, mt / th, 1 - mr / tw, 1 - mb / th ]
    const basp = (a != null) ? a * (pw / ph) : null
    const tasp = (a != null) ? a * (tw / th) : null
    return [ crect, brect, basp, tasp ]
}

//
// rect utils
//

// rect stats
function rect_size(rect) {
    const [ x1, y1, x2, y2 ] = rect
    return [ x2 - x1, y2 - y1 ]
}

function rect_dims(rect) {
    const [ w, h ] = rect_size(rect)
    return [ abs(w), abs(h) ]
}

function rect_center(rect) {
    const [ x1, y1, x2, y2 ] = rect
    return [ (x1 + x2) / 2, (y1 + y2) / 2 ]
}

function rect_radius(rect) {
    const [ w, h ] = rect_size(rect)
    return [ w / 2, h / 2 ]
}

function rect_aspect(rect) {
    const [ w, h ] = rect_dims(rect)
    return w / h
}

// radial rect: center, radius
function rect_radial(rect) {
    const [ cx, cy ] = rect_center(rect)
    const [ rx, ry ] = rect_radius(rect)
    return [ cx, cy, rx, ry ]
}

function radial_rect(p, r) {
    const [ x, y ] = p
    const [ rx, ry ] = is_scalar(r) ? [ r, r ] : r
    return [ x - rx, y - ry, x + rx, y + ry ]
}

// box rect: min, size
function rect_box(rect) {
    const [ x1, y1, x2, y2 ] = rect
    const [ w, h ] = [ x2 - x1, y2 - y1 ]
    return [ x1, y1, w, h ]
}

function box_rect(box) {
    const [ x, y, w, h ] = box
    return [ x, y, x + w, y + h ]
}

// center box rect: center, size
function rect_cbox(rect) {
    const [ cx, cy ] = rect_center(rect)
    const [ w, h ] = rect_size(rect)
    return [ cx, cy, w, h ]
}

function cbox_rect(cbox) {
    const [ cx, cy, w, h ] = cbox
    const [ rx, ry ] = [ w / 2, h / 2 ]
    return [ cx - rx, cy - ry, cx + rx, cy + ry ]
}

// rect aggregators
function merge_rects(...rects) {
    if (rects.length == 0) return null
    if (rects.length == 1) return rects[0]
    const [ xa, ya, xb, yb ] = zip(...rects)
    const [ xs, ys ] = [ [ ...xa, ...xb ], [ ...ya, ...yb ] ]
    return [ min(...xs), min(...ys), max(...xs), max(...ys) ]
}

function merge_points(...points) {
    const [ xs, ys ] = zip(...points)
    return [ min(...xs), min(...ys), max(...xs), max(...ys) ]
}

function aspect_invariant(value, aspect, alpha = 0.5) {
    aspect = aspect ?? 1

    const wfact = aspect**alpha
    const hfact = aspect**(1 - alpha)

    if (is_scalar(value)) {
        value = [ value, value ]
    }

    if (value.length == 2) {
        const [ vw, vh ] = value
        return [ vw * wfact, vh / hfact ]
    } else if (value.length == 4) {
        const [ vl, vt, vr, vb ] = value
        return [ vl * wfact, vt / hfact, vr * wfact, vb / hfact ]
    }
}

//
// attributes
//

function prefix_split(pres, attr) {
    const attr1 = { ...attr }
    const pres1 = pres.map(p => `${p}_`)
    const out = pres.map(p => Object())
    Object.keys(attr).map(k => {
        pres.forEach((p, i) => {
            if (k.startsWith(pres1[i])) {
                const k1 = k.slice(p.length + 1)
                out[i][k1] = attr1[k]
                delete attr1[k]
            }
        })
    })
    return [ ...out, attr1 ]
}

function prefix_add(pre, attr) {
    return Object.fromEntries(
        Object.entries(attr).map(([ k, v ]) => [ `${pre}_${k}`, v ])
    )
}

//
// string formatters
//

function demangle(k) {
    return k.replace('_', '-')
}

function rounder(x, prec) {
    prec = prec ?? prec_base

    let suf
    if (is_string(x) && x.endsWith('px')) {
        x = Number(x.slice(0, -2))
        suf = 'px'
    } else {
        suf = ''
    }

    let ret
    if (is_scalar(x)) {
        ret = x.toFixed(prec)
        ret = ret.replace(/(\.[0-9]*?)0+$/, '$1').replace(/\.$/, '')
    } else {
        ret = x
    }

    return ret + suf
}

function props_repr(d, prec) {
    return Object.entries(d)
        .filter(([k, v]) => v != null)
        .map(([k, v]) => `${demangle(k)}="${rounder(v, prec)}"`)
        .join(' ')
}

//
// color handling
//

function hexToRgba(hex) {
    hex = hex.replace('#', '')
    if (hex.length == 3) {
        hex = hex.split('').map(c => c + c).join('')
    } else if (hex.length == 4) {
        hex = hex.split('').map(c => c + c).join('')
    }
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const a = hex.length == 8 ? parseInt(hex.slice(6, 8), 16) : 255
    return [ r, g, b, a / 255 ]
  }

function palette(start0, stop0, clim = lim_base) {
    const start = hexToRgba(start0)
    const stop = hexToRgba(stop0)
    const slope = sub(stop, start)
    const scale = rescaler(clim, lim_base)
    function gradient(x) {
        const x1 = scale(x)
        const [ r, g, b, a ] = add(start, mul(slope, x1))
        return `rgba(${r}, ${g}, ${b}, ${a})`
    }
    return gradient
}

//
// core classes
//

function align_frac(align) {
    if (is_scalar(align)) {
        return align
    } else if (align == 'left' || align == 'top') {
        return 0
    } else if (align == 'center' || align == 'middle') {
        return 0.5
    } else if (align == 'right' || align == 'bottom') {
        return 1
    } else{
        throw new Error(`Unrecognized alignment specification: ${align}`)
    }
}

function abs_min(x, y) {
    return abs(x) < abs(y) ? x : y
}

function abs_max(x, y) {
    return abs(x) > abs(y) ? x : y
}

function embed_rect(size, { aspect = null, expand = false } = {}) {
    if (aspect == null) return size
    const [ w0, h0 ] = size
    const agg = expand ? abs_max : abs_min
    const h = agg(w0 / aspect, h0)
    const w = h * aspect
    return [ w, h ]
}

function rotate_rect(size, rotate, { aspect = null, expand = false, invar = false, tol = 0.001 } = {}) {
    // knock out easy case
    if (rotate == 0 || invar) return embed_rect(size, { aspect, expand })

    // unpack inputs
    const [ w0, h0 ] = size
    const theta = d2r * rotate

    // trig compute
    const COS = abs(cos(theta))
    const SIN = abs(sin(theta))

    // rotate rect
    let [ w, h ] = size
    if (aspect != null) {
        // this has an exact solution
        const DW = aspect * COS + SIN
        const DH = aspect * SIN + COS
        const agg = expand ? abs_max : abs_min
        h = agg(w0 / DW, h0 / DH)
        w = h * aspect
    } else {
        // this has some degeneracy, which we resolve with maximal area
        // max Area = w * h
        // st  C * w + S * h <= w0
        //     C * h + S * w <= h0
        const paspect = abs(w0 / h0)
        const TAN = abs(tan(theta))
        const COT = abs(cot(theta))
        const [ TL, TH ] = [ min(TAN, COT), max(TAN, COT) ]
        if (paspect < TL) {
            w = w0 / (2 * COS)
            h = w0 / (2 * SIN)
        } else if (paspect > TH) {
            w = h0 / (2 * SIN)
            h = h0 / (2 * COS)
        } else {
            const denom = COS * COS - SIN * SIN
            if (abs(denom) < tol) {
                // this uses a leontieff objective
                const t = abs_min(w0, h0) / (COS + SIN)
                w = h = t
            } else {
                w = (w0 * COS - h0 * SIN) / denom
                h = (h0 * COS - w0 * SIN) / denom
            }
        }
    }

    // return base and rotated rect sizes
    return [ w, h ]
}

function rotate_aspect(aspect, rotate) {
    if (aspect == null || rotate == null) return aspect
    const theta = d2r * rotate
    const SIN = abs(sin(theta))
    const COS = abs(cos(theta))
    const DW = aspect * COS + SIN
    const DH = aspect * SIN + COS
    return DW / DH
}

function ensure_upright(rect) {
    const [ x10, y10, x20, y20 ] = rect
    return [
        min(x10, x20), min(y10, y20),
        max(x10, x20), max(y10, y20),
    ]
}

function rescaler(lim_in, lim_out) {
    const [ in_lo, in_hi ] = lim_in
    const [ out_lo, out_hi ] = lim_out
    const [ in_len, out_len ] = [ in_hi - in_lo, out_hi - out_lo ]
    return x => {
        const f = (x - in_lo) / in_len
        return out_lo + f * out_len
    }
}

function resizer(lim_in, lim_out) {
    const [ in_lo, in_hi ] = lim_in
    const [ out_lo, out_hi ] = lim_out
    const [ in_len, out_len ] = [ in_hi - in_lo, out_hi - out_lo ]
    return x => x * abs(out_len) / abs(in_len)
}

// context holds the current pixel rect and other global settings
// map() will create a new sub-context using rect in coord space
// map*() functions map from coord to pixel space (in prect)
// TODO: bring back rotate
class Context {
    constructor({ prect = rect_base, coord = coord_base, transform = null, prec = prec_base, debug = false } = {}) {
        // coordinate transform
        this.prect = prect // drawing rect
        this.coord = coord // coordinate rect
        this.transform = transform // rotation transform

        // top level arguments
        this.prec = prec // string precision
        this.debug = debug // debug mode

        // make rescaler / resizer
        const [ cx1, cy1, cx2, cy2 ] = coord
        const [ px1, py1, px2, py2 ] = prect
        this.rescalex = rescaler([ cx1, cx2 ], [ px1, px2 ])
        this.rescaley = rescaler([ cy1, cy2 ], [ py1, py2 ])
        this.resizex = resizer([ cx1, cx2 ], [ px1, px2 ])
        this.resizey = resizer([ cy1, cy2 ], [ py1, py2 ])
    }

    // map point from coord to pixel
    mapPoint(cpoint) {
        const [ cx, cy ] = cpoint
        return [ this.rescalex(cx), this.rescaley(cy) ]
    }

    // map rect from coord to pixel
    mapRect(crect) {
        const [ x1, y1, x2, y2 ] = crect
        return [
            this.rescalex(x1), this.rescaley(y1),
            this.rescalex(x2), this.rescaley(y2),
        ]
    }

    // map from range to pixel
    mapRange(direc, climit) {
        direc = ensure_orient(direc)
        const [ clo, chi ] = climit
        const rescale = direc == 'v' ? this.rescaley : this.rescalex
        return [ rescale(clo), rescale(chi) ]
    }

    // map size from coord to pixel
    mapSize(csize) {
        const [ sw, sh ] = csize
        return [ this.resizex(sw), this.resizey(sh) ]
    }

    // NOTE: this is the main mapping function! be very careful when changing it!
    map({ rect, aspect = null, expand = false, align = 'center', rotate = 0, invar = false, coord = coord_base } = {}) {
        // use parent coord as default rect
        rect ??= ensure_upright(this.coord)

        // get true pixel rect
        const prect0 = this.mapRect(rect)
        const [ x0, y0, w0, h0 ] = rect_cbox(prect0)

        // rotate rect inside
        const [ w, h ] = rotate_rect([ w0, h0 ], rotate, { aspect, expand, invar })
        const transform = rotate != 0 ? `rotate(${rotate}, ${x0}, ${y0})` : null

        // broadcast align into [ halign, valign ] components
        const [ hafrac, vafrac ] = ensure_vector(align, 2).map(align_frac)
        const [ x, y ] = [
            x0 + (hafrac - 0.5) * (w - w0),
            y0 + (vafrac - 0.5) * (h - h0),
        ]

        // return new context
        const prect = cbox_rect([ x, y, w, h ])
        return new Context({ prect, coord, transform, prec: this.prec, debug: this.debug })
    }
}

// spec keys
const spec_keys = [ 'rect', 'aspect', 'expand', 'align', 'rotate', 'invar', 'coord' ]

// NOTE: if children gets here, it was ignored by the constructor (so dump it)
class Element {
    constructor({ tag, unary, children, ...attr } = {}) {
        // core display
        this.tag = tag
        this.unary = unary

        // store layout params and attributes
        this.spec = filter_object(attr, (k, v) => v != null &&  spec_keys.includes(k))
        this.attr = filter_object(attr, (k, v) => v != null && !spec_keys.includes(k))

        // adjust aspect for rotation
        const { aspect, rotate } = this.spec
        this.spec.raspect = rotate_aspect(aspect, rotate)

        // warn if children are passed
        if (children != null) console.warn(`Got children in ${this.tag}`)
    }

    props(ctx) {
        const { transform, debug } = ctx
        const attr = { ...this.attr, transform }
        if (debug) {
            const { name } = this.constructor
            attr['gum-class'] = name.toLowerCase()
        }
        return attr
    }

    inner(ctx) {
        return ''
    }

    svg(ctx) {
        // default context
        ctx ??= new Context()

        // collect all properties
        const pvals = this.props(ctx)
        const props = props_repr(pvals, ctx.prec)
        const pre = props.length > 0 ? ' ' : ''

        // return final svg
        if (this.unary) {
            return `<${this.tag}${pre}${props} />`
        } else {
            return `<${this.tag}${pre}${props}>${this.inner(ctx)}</${this.tag}>`
        }
    }
}

function children_bounds(children) {
    const ctx = new Context()
    const rects = children.map(c => ctx.map(c.spec).prect)
    return rects.length > 0 ? merge_rects(...rects) : null
}

class Group extends Element {
    constructor({ children: children0, coord, aspect, tag = 'g', clip = true, ...attr } = {}) {
        const children = ensure_array(children0)

        // extract specs from children
        const bounds = children_bounds(children)
        if (clip && aspect == null && bounds != null) aspect = rect_aspect(bounds)

        // pass to Element
        super({ tag, unary: false, coord, aspect, ...attr })
        this.children = children
        this.bounds = bounds
    }

    inner(ctx) {
        // empty group
        if (this.children.length == 0) return '\n'

        // map to new contexts and render
        let inside = this.children
            .map(c => c.svg(ctx.map(c.spec)))
            .filter(s => s.length > 0)
            .join('\n')

        // return padded
        return `\n${inside}\n`
    }
}

class Svg extends Group {
    constructor({ children: children0, size = outer_base, prec = prec_base, bare = false, filters = null, debug = false, ...attr } = {}) {
        const children = ensure_array(children0)

        // handle filters
        if (filters != null) {
            const defs = new Defs(filters)
            children = [ defs, ...children ]
        }

        // pass to Group
        const svg_attr = bare ? {} : svg_attr_base
        super({ tag: 'svg', children, ...svg_attr, ...attr })

        // auto-detect size and aspect
        size = is_scalar(size) ? [ size, size ] : size
        size = embed_rect(size, { aspect: this.spec.aspect })

        // store core params
        this.size = size
        this.prec = prec
        this.debug = debug
    }

    props(ctx) {
        const attr = super.props(ctx)
        const [ w, h ] = this.size
        const viewBox = `0 0 ${rounder(w, ctx.prec)} ${rounder(h, ctx.prec)}`
        return { viewBox, xmlns: svgns, ...attr }
    }

    svg(args) {
        const prect = [ 0, 0, ...this.size ]
        const ctx = new Context({ prect, prec: this.prec, debug: this.debug, ...args })
        return super.svg(ctx)
    }
}

//
// layout classes
//

function check_singleton(children) {
    const is_array = Array.isArray(children)
    if (children == null || (is_array && children.length != 1)) {
        throw Error('Must have exactly one child')
    }
    return is_array ? children[0] : children
}

// TODO: auto-adjust padding/margin for aspect
//       it seems adjust only does this if child aspect is not null
//       but we also want to do it if own aspect is not null
class Frame extends Group {
    constructor({ children: children0, padding = 0, margin = 0, border = 0, aspect, adjust = true, flex = false, shape, rounded, stroke, fill, border_none, ...attr0 } = {}) {
        const child = check_singleton(children0)
        const [border_attr, attr] = prefix_split(['border'], attr0)

        // tailwind style booleans
        if (border === true) border = 1
        if (padding === true) padding = padding_true
        if (margin === true) margin = margin_true
        if (rounded === true) rounded = rounded_true
        if (fill === true) fill = gray

        // ensure shape is a function
        if (shape == null) {
            if (rounded == null) {
                shape = (a => new Rect(a))
            } else {
                shape = (a => new RoundedRect({ rounded, ...a }))
            }
        } else {
            shape = ensure_function(shape)
        }

        // convenience boxing
        padding = pad_rect(padding)
        margin = pad_rect(margin)

        // aspect adjusted padding/margin
        const { raspect: child_aspect } = child.spec
        if (adjust && child_aspect != null) {
            padding = aspect_invariant(padding, 1 / child_aspect)
            margin = aspect_invariant(margin, 1 / child_aspect)
        }

        // get box sizes
        // TODO: this is not coord aware yet
        const iasp = aspect ?? child_aspect
        const [ crect, brect, basp, tasp ] = map_padmar(padding, margin, iasp)
        aspect = flex ? null : (aspect ?? tasp)

        // make border box
        const rect = shape({ rect: brect, stroke_width: border, stroke, fill, ...border_attr })

        // assign rect to child
        child.spec.rect = crect

        // pass to Group
        super({ children: [rect, child], aspect, clip: false, ...attr })
    }
}

function ensure_orient(direc) {
    if (direc == 'v') {
        return 'v'
    } else if (direc == 'h') {
        return 'h'
    } else {
        throw new Error(`Unrecognized direction specification: ${direc}`)
    }
}

// fill in missing values to ensure: sum(vals) == target
function distribute_extra(vals, target) {
    target = target ?? 1
    const nmiss = vals.filter(v => v == null).length
    const total = sum(vals)
    const fill = (nmiss > 0) ? (target - total) / nmiss : 0
    return vals.map(v => v ?? fill)
}

// expects list of Element or [Element, height]
// this is written as vertical, horizonal swaps dimensions and inverts aspects
class Stack extends Group {
    constructor({ children: children0, direc, expand = true, align = 'center', spacing = 0, aspect = 'auto', ...attr } = {}) {
        const children = ensure_array(children0)
        direc = ensure_orient(direc)
        spacing = spacing === true ? spacing_true : spacing

        // short circuit if empty
        if (children.length == 0) return super({ aspect, ...attr })

        // fill in missing heights with null
        let heights = children.map(c => c.attr.size)
        let aspects = children.map(c => c.spec.aspect)

        // get aspects and adjust for direction
        const hasa = any(zip(heights, aspects).map(
            ([h, a]) => a != null && h != null
        )) || all(aspects.map(a => a != null))
        if (direc == 'h') aspects = aspects.map(a => (a != null) ? 1 / a : null)

        // expand elements to fit width?
        let aspect_ideal = null, wlims
        if (expand && !hasa) {
            // aspectless and full width
            heights = distribute_extra(heights)
            wlims = heights.map(w => [ 0, 1 ])
        } else if (expand && hasa) {
            // if aspect, heights are adjusted so that all elements have full width
            // if no aspect, they can be stretched to full width anyway
            heights = zip(heights, aspects).map(([h, a]) => (a != null) ? 1/a : h)

            // renormalize heights and find ideal aspect
            const has = zip(heights, aspects)
            const atot = sum(has.map(([h, a]) => (a != null) ? h : null))
            const utot = sum(has.map(([h, a]) => (a == null) ? h : null))
            heights = has.map(([h, a]) => (a != null) ? (1-utot)*(h/atot) : h)
            aspect_ideal = (1 - utot) / atot

            // width is always full with expand
            wlims = heights.map(w => [ 0, 1 ])
        } else {
            // fill in missing heights and find aspect widths
            heights = distribute_extra(heights)
            let widths = zip(heights, aspects).map(([h, a]) => (a != null) ? h * a : null)

            // ideal aspect determined by widest element
            const wmax = max(...widths) ?? 1
            widths = widths.map(w => (w != null) ? w/wmax : 1)
            aspect_ideal = wmax

            // set wlims according to alignment
            const afrac = align_frac(align)
            wlims = widths.map(w => (w != null) ? [ afrac * (1 - w), afrac + (1 - afrac) * w ] : [ 0, 1 ])
        }

        // convert heights to cumulative intervals (with spacing)
        let pos = -spacing
        let hlims = heights.map(y => [ pos += spacing, pos += y ])
        hlims = hlims.map(([ h1, h2 ]) => [ h1/pos, h2/pos ])
        aspect_ideal = (aspect_ideal != null) ? aspect_ideal / pos : null

        // if any element has an aspect, use ideal aspect
        // otherwise, just go with null aspect unless specified
        if (aspect == 'auto') {
            aspect = aspect_ideal
        } else if (aspect == 'none') {
            aspect = null
        }

        // swap dims if horizontal
        if (direc == 'h') {
            [ wlims, hlims ] = [ hlims, wlims ]
            aspect = (aspect != null) ? 1 / aspect : null
        }

        // assign child rects
        zip(children, wlims, hlims).forEach(([child, [fw0, fw1], [fh0, fh1]]) => {
            child.spec.rect = [ fw0, fh0, fw1, fh1 ]
        })

        // pass to Group
        super({ children, aspect, ...attr })
    }
}

class VStack extends Stack {
    constructor(attr) {
        super({ direc: 'v', ...attr })
    }
}

class HStack extends Stack {
    constructor(attr) {
        super({ direc: 'h', ...attr })
    }
}

/* grid layout and aspect computation (grok)
\log(\mu) = \frac{1}{M N} \sum_{i=1}^M \sum_{j=1}^N \log a_{ij}
\log(u)_j = \frac{1}{M} \sum_{i=1}^M \log a_{ij} - \log(\mu)
\log(v)_i = \log(\mu) - \frac{1}{N} \sum_{j=1}^N \log a_{ij}
w_j = \frac{u_j}{\sum_{k=1}^N u_k}
h_i = \frac{v_i}{\sum_{k=1}^M v_k}
\log(a) = \log(\mu) - \frac{1}{N} \sum_{j=1}^N \log(w_j) + \frac{1}{M} \sum_{i=1}^M \log(h_i)
*/

class Grid extends Group {
    constructor({ children, rows, cols, widths, heights, spacing, aspect, ...attr } = {}) {
        spacing = ensure_vector(spacing ?? 0, 2);
        rows = rows ?? children.length;
        cols = cols ?? max(...children.map(row => row.length));

        // fill in missing rows and columns
        const spacer = new Spacer();
        const filler = repeat(spacer, cols);
        children = children.map(row => padvec(row, cols, spacer));
        children = padvec(children, rows, filler);

        // aggregate aspect ratios along rows and columns (assuming null goes to 1)
        const aspect_grid = children.map(row => row.map(e => e.aspect ?? 1));
        const log_aspect = aspect_grid.map(row => row.map(log));

        // these are exact for equipartitioned grids (row or column)
        const log_mu = mean(log_aspect.map(row => mean(row)));
        const log_uj = zip(...log_aspect).map(mean).map(x => x - log_mu);
        const log_vi = log_aspect.map(mean).map(x => log_mu - x);

        // implement findings
        widths = widths ?? normalize(log_uj.map(exp));
        heights = heights ?? normalize(log_vi.map(exp));
        const aspect_ideal = exp(log_mu - mean(widths.map(log)) + mean(heights.map(log)));

        // adjust widths and heights to account for spacing
        const [spacex, spacey] = spacing;
        const [scalex, scaley] = [1 - spacex * (cols-1), 1 - spacey * (rows-1)];
        widths = widths.map(w => scalex * w);
        heights = heights.map(h => scaley * h);
        aspect = (1-spacey*(rows-1))/(1-spacex*(cols-1)) * aspect_ideal;

        // get top left positions
        const lpos = cumsum(widths.map(w => w + spacex));
        const tpos = cumsum(heights.map(h => h + spacey));
        const cbox = zip(lpos, widths).map(([l, w]) => [l, l + w]);
        const rbox = zip(tpos, heights).map(([t, h]) => [t, t + h]);

        // make grid
        const grid = meshgrid(rbox, cbox).map(([[y0, y1], [x0, x1]]) => [x0, y0, x1, y1]);
        const childgrid = zip(children.flat(), grid);

        // pass to Group
        super({ children: childgrid, aspect, ...attr });
    }
}

class Place extends Group {
    constructor({ children: children0, pos, rad, ...attr } = {}) {
        const child = check_singleton(children0)
        attr.rect ??= radial_rect(pos, rad)
        child.spec = { ...child.spec, ...attr }
        super({ children: child, clip: false })
    }
}

class Flip extends Group {
    constructor({ children: children0, direc, ...attr } = {}) {
        const child = check_singleton(children0)
        direc = ensure_orient(direc)
        child.spec.rect = direc == 'v' ? [0, 1, 1, 0] : [1, 0, 0, 1]
        super({ children: child, ...attr })
    }
}

class VFlip extends Flip {
    constructor(attr) {
        super({ direction: 'v', ...attr })
    }
}

class HFlip extends Flip {
    constructor(attr) {
        super({ direction: 'h', ...attr })
    }
}

const anchor_rect = {
    'left': [ 0, 0, 0, 1 ], 'right' : [ 1, 0, 1, 1 ],
    'top' : [ 0, 0, 1, 0 ], 'bottom': [ 0, 1, 1, 1 ],
}

class Anchor extends Group {
    constructor({ children: children0, side, align, ...attr } = {}) {
        const child = check_singleton(children0)

        // assign spec to child
        child.spec.rect = anchor_rect[side]
        child.spec.align = align ?? 1 - align_frac(side)
        child.spec.expand = true

        // pass to Group
        super({ children: child, clip: false, ...attr })
    }
}

class Attach extends Group {
    constructor({ children: children0, offset = 0, size = 1, align = 'center', side, ...attr } = {}) {
        const child = check_singleton(children0)

        // get extent and map
        const extent = size + offset
        const rmap = {
            'left': [ -extent, 0, -offset, 1 ], 'right' : [ 1+offset, 0, 1+extent, 1 ],
            'top' : [ 0, -extent, 1, -offset ], 'bottom': [ 0, 1+offset, 1, 1+extent ],
        }

        // assign spec to child
        child.spec.rect = rmap[side]
        child.spec.align = align

        // pass to Group
        super({ children: child, clip: false, ...attr })
    }
}

// TODO: add pos/rad reading with children
class Points extends Group {
    constructor({ children: children0, points, size = 0.01, shape: shape0, ...attr0 } = {}) {
        const shape = ensure_function(shape0 ?? (a => new Dot(a)))
        const [ point_attr, attr ] = prefix_split([ 'point' ], attr0)

        // construct children (pos or [pos, rad])
        const children = children0 ?? points.map(pr => {
            const [ pos, rad ] = is_scalar(pr[0]) ? [pr, size] : pr
            const s = shape({ ...point_attr, pos, rad })
            return s
        })

        // extract rect from pos and rad
        const elems = children.map(c => {
            const { pos, rad } = c.attr
            c.spec.rect = radial_rect(pos, rad)
            return c
        })

        // pass to Group
        super({ children: elems, clip: false, ...attr })
    }
}

// BORKEN
class Absolute extends Element {
    constructor({ children: children0, size, ...attr } = {}) {
        const child = check_singleton(children0)
        super({ tag: 'g', unary: false, ...attr })
        this.child = child
        this.size = size
        this.place = attr
    }

    inner(ctx) {
        const { prect } = ctx
        const { aspect } = this.child.spec

        // get relative size from absolute size
        const pcent = rect_center(prect)
        const pradi = rect_radial(prect)
        const psize = ensure_vector(this.size, 2)
        const rect = radial_rect(pcent, div(psize, pradi))

        // render child element
        const ctx1 = ctx.map({ rect, aspect })
        return this.child.svg(ctx1)
    }
}

//
// basic geometry
//

// this can have an aspect, which is utilized by layouts
class Spacer extends Element {
    constructor(attr) {
        super({ tag: 'g', unary: true, ...attr })
    }

    svg(ctx) {
        return ''
    }
}

class Line extends Element {
    constructor({ pos1, pos2, ...attr } = {}) {
        super({ tag: 'line', unary: true, ...attr })
        this.pos1 = pos1
        this.pos2 = pos2
    }

    props(ctx) {
        const attr = super.props(ctx)
        const [ x1, y1 ] = ctx.mapPoint(this.pos1)
        const [ x2, y2 ] = ctx.mapPoint(this.pos2)
        return { x1, y1, x2, y2, ...attr }
    }
}

// plottable and coord adaptive
class UnitLine extends Line {
    constructor({ direc, ...attr } = {}) {
        direc = ensure_orient(direc)

        // construct line positions
        const [ pos1, pos2 ] = (direc == 'v') ?
            [ [ 0.5, 0 ], [ 0.5, 1 ] ] :
            [ [ 0, 0.5 ], [ 1, 0.5 ] ]
        super({ pos1, pos2, ...attr })
    }
}

class VLine extends UnitLine {
    constructor(attr) {
        super({ direc: 'v', ...attr })
    }
}

class HLine extends UnitLine {
    constructor(attr) {
        super({ direc: 'h', ...attr })
    }
}

class Rect extends Element {
    constructor({ rounded, ...attr } = {}) {
        super({ tag: 'rect', unary: true, ...attr })
        this.rounded = rounded === true ? rounded_true : rounded
    }

    props(ctx) {
        // get core attributes
        const attr = super.props(ctx)

        // get true pixel rect
        const { prect } = ctx
        let [ x, y, w, h ] = rect_box(prect)

        // orient increasing
        if (w < 0) { x += w; w *= -1 }
        if (h < 0) { y += h; h *= -1 }

        // scale border rounded
        let rx, ry
        if (this.rounded != null) {
            let s = 0.5 * (w + h)
            if (is_scalar(this.rounded)) {
                rx = s * this.rounded
            } else {
                [ rx, ry ] = mul(this.rounded, s)
            }
        }

        // output properties
        return { x, y, width: w, height: h, rx, ry, ...attr }
    }
}

class Square extends Rect {
    constructor(attr) {
        super({ aspect: 1, ...attr })
    }
}

class Ellipse extends Element {
    constructor(attr) {
        super({ tag: 'ellipse', unary: true, ...attr })
    }

    props(ctx) {
        const attr = super.props(ctx)
        const { prect } = ctx
        const [ cx, cy, rx, ry ] = rect_radial(prect)
        return { cx, cy, rx, ry, ...attr }
    }
}

class Circle extends Ellipse {
    constructor(attr) {
        super({ aspect: 1, ...attr })
    }
}

class Dot extends Circle {
    constructor({ stroke = 'black', fill = 'black', ...attr } = {}) {
        super({ stroke, fill, ...attr })
    }
}

class Ray extends Line {
    constructor({ angle = 45, ...attr } = {}) {
        // map into (-90, 90]
        if (angle < -90 || angle > 90) {
            angle = ((angle + 90) % 180) - 90
        }
        if (angle == -90) {
            angle = 90
        }

        // map theta into direction and aspect
        let direc, aspect
        if (angle == 90) {
            direc = Infinity
            aspect = 1
        } else if (angle == 0) {
            direc = 0
            aspect = 1
        } else {
            direc = tan(angle * (pi / 180))
            aspect = 1 / abs(direc)
        }

        // calculate correct line direction
        let pos1, pos2
        if (!isFinite(direc)) {
            [ pos1, pos2 ] = [[0.5, 0], [0.5, 1]]
        } else if (direc == 0) {
            [ pos1, pos2 ] = [[0, 0.5], [1, 0.5]]
        } else if (direc > 0) {
            [ pos1, pos2 ] = [[0, 0], [1, 1]]
        } else {
            [ pos1, pos2 ] = [[0, 1], [1, 0]]
        }

        // pass to Line
        super({ pos1: p1, pos2: p2, aspect, ...attr })
    }
}

//
// path builder
//

function pointstring(pixels, prec = 2) {
    return pixels.map(([ x, y ]) =>
        `${rounder(x, prec)},${rounder(y, prec)}`
    ).join(' ')
}

class Pointstring extends Element {
    constructor({ tag, points, ...attr } = {}) {
        super({ tag, unary: true, ...attr })
        this.points = points

        // compute bounding box
        const [ xvals, yvals ] = zip(...this.points)
        this.bounds = [ min(...xvals), min(...yvals), max(...xvals), max(...yvals) ]
    }

    props(ctx) {
        const attr = super.props(ctx)
        const pixels = this.points.map(p => ctx.mapPoint(p))
        const points = pointstring(pixels, ctx.prec)
        return { points, ...attr }
    }
}

class Polyline extends Pointstring {
    constructor({ points, ...attr } = {}) {
        super({ tag: 'polyline', points, fill: 'none', ...attr })
    }
}

class Polygon extends Pointstring {
    constructor({ points, ...attr } = {}) {
        super({ tag: 'polygon', points, ...attr })
    }
}

class Triangle extends Polygon {
    constructor(attr = {}) {
        const points = [[0.5, 0], [1, 1], [0, 1]]
        super({ points, ...attr })
    }
}

class Path extends Element {
    constructor({ cmds, ...attr } = {}) {
        super({ tag: 'path', unary: true, ...attr })
        this.cmds = cmds
    }

    props(ctx) {
        const attr = super.props(ctx)
        const d = this.cmds.map(c => c.data(ctx)).join(' ')
        return { d, ...attr }
    }
}

class Command {
    constructor(cmd) {
        this.cmd = cmd
    }

    args(ctx) {
        return ''
    }

    data(ctx) {
        return `${this.cmd} ${this.args(ctx)}`
    }
}

class MoveCmd extends Command {
    constructor(pos) {
        super('M')
        this.pos = pos
    }

    args(ctx) {
        const [ x, y ] = ctx.mapPoint(this.pos)
        return `${rounder(x, ctx.prec)} ${rounder(y, ctx.prec)}`
    }
}

class LineCmd extends Command {
    constructor(pos) {
        super('L')
        this.pos = pos
    }

    args(ctx) {
        const [ x, y ] = ctx.mapPoint(this.pos)
        return `${rounder(x, ctx.prec)} ${rounder(y, ctx.prec)}`
    }
}

class ArcCmd extends Command {
    constructor(pos, rad, large, sweep) {
        super('A')
        this.pos = pos
        this.rad = rad
        this.large = large
        this.sweep = sweep
    }

    args(ctx) {
        const [ x1, y1 ] = ctx.mapPoint(this.pos)
        const [ rx, ry ] = ctx.mapSize(this.rad)
        return `${rounder(rx, ctx.prec)} ${rounder(ry, ctx.prec)} 0 ${this.large} ${this.sweep} ${rounder(x1, ctx.prec)} ${rounder(y1, ctx.prec)}`
    }
}

// this makes a rounded corner between two points
// the direction is by default counter-clockwise
// this assumes the cursor is at pos0
class CornerCmd {
    constructor(pos0, pos1) {
        this.pos0 = pos0
        this.pos1 = pos1
    }

    data(ctx) {
        const [ x0, y0 ] = ctx.mapPoint(this.pos0)
        const [ x1, y1 ] = ctx.mapPoint(this.pos1)

        // compute aspect ratio
        const [ dx, dy ] = [ Math.abs(x1 - x0), Math.abs(y1 - y0) ]
        const aspect = dx / dy

        // are we in quadrants 1/3 or 2/4?
        const [ top, right ] = [ x1 < x0, y1 < y0 ]
        const [ diag, wide ] = [ top == right, aspect > 1 ]

        // get corner point and fitted radius
        const [ cx, cy ] = diag ? [ x0, y1 ] : [ x1, y0 ]
        const rad = Math.min(dx, dy)

        // get the intra-radial points
        const sigx = right ? -1 :  1
        const sigy = top   ?  1 : -1
        const [ x0p, y0p ] = diag ? [ cx, cy + sigy * rad ] : [ cx + sigx * rad, cy ]
        const [ x1p, y1p ] = diag ? [ cx + sigx * rad, cy ] : [ cx, cy + sigy * rad ]

        // full command
        return (
            ((diag != wide) ? `L ${rounder(x0p, ctx.prec)} ${rounder(y0p, ctx.prec)} ` : '')
            + `A ${rounder(rad, ctx.prec)} ${rounder(rad, ctx.prec)} 0 0 0 ${rounder(x1p, ctx.prec)} ${rounder(y1p, ctx.prec)} `
            + ((diag == wide) ? `L ${rounder(x1, ctx.prec)} ${rounder(y1, ctx.prec)} ` : '')
        )
    }
}

function norm_angle(deg) {
    if (deg == 360) return 359.99
    deg = deg % 360
    return deg < 0 ? deg + 360 : deg
}

class Arc extends Path {
    constructor({ deg0, deg1, ...attr } = {}) {
        deg0 = norm_angle(deg0)
        deg1 = norm_angle(deg1)

        // get radian angles
        const th0 = d2r * deg0
        const th1 = d2r * deg1

        // get start/stop points
        const pos0 = [ 0.5 + 0.5 * cos(th0), 0.5 - 0.5 * sin(th0) ]
        const pos1 = [ 0.5 + 0.5 * cos(th1), 0.5 - 0.5 * sin(th1) ]

        // get large/sweep flags
        const delta = norm_angle(deg1 - deg0)
        const large = delta > 180 ? 1 : 0
        const sweep = delta < 0 ? 1 : 0

        // send commands to path
        const cmds = [
            new MoveCmd(pos0),
            new ArcCmd(pos1, rad, large, sweep),
        ]
        super({ cmds, ...attr })
    }
}

function parse_rounded(rounded) {
    if (is_scalar(rounded)) {
        rounded = [rounded, rounded, rounded, rounded]
    } else if (is_array(rounded) && rounded.length == 2) {
        const [ rx, ry ] = rounded
        rounded = [[rx, ry], [rx, ry], [rx, ry], [rx, ry]]
    }
    return rounded.map(r => ensure_vector(r, 2))
}

// supports different rounded for each corner
class RoundedRect extends Path {
    constructor({ rounded = 0, border = 1, ...attr } = {}) {

        // convert to array of arrays
        const [rtl, rtr, rbr, rbl] = parse_rounded(rounded)
        const [ [rtlx, rtly], [rtrx, rtry] ] = [ rtl, rtr ]
        const [ [rbrx, rbry], [rblx, rbly] ] = [ rbr, rbl ]

        // make command list
        const cmds = [
            new MoveCmd([1 - rtrx, 0]),
            new LineCmd([rtlx, 0]),
            new CornerCmd([rtlx, 0], [0, rtly]),
            new LineCmd([0, 1 - rbly]),
            new CornerCmd([0, 1 - rbly], [rblx, 1]),
            new LineCmd([rbrx, 1]),
            new CornerCmd([rbrx, 1], [1, 1 - rbry]),
            new LineCmd([1, rtry]),
            new CornerCmd([1, rtry], [1 - rtrx, 0]),
        ]

        // pass to Path
        super({ cmds, stroke_width: border, ...attr })
    }
}

//
// filters and effects
//

// random 6-digit hex
function random_hex() {
    return Math.floor(Math.random()*0x1000000).toString(16)
}

class MetaElement {
    constructor({ tag, ...attr } = {}) {
        this.tag = tag
        this.attr = attr
    }

    inside(ctx) {
        return null
    }

    svg(ctx) {
        const inside = this.inside(ctx)
        const props = Object.entries(this.attr).map(([k, v]) =>
            `${k.replace('_', '-')}="${v}"`
        ).join(' ')
        if (inside == null) {
            return `<${this.tag} ${props} />`
        } else {
            return `<${this.tag} ${props}>\n${inside}\n</${this.tag}>`
        }
    }
}

class MetaGroup extends MetaElement {
    constructor({ children, tag, ...attr } = {}) {
        super({ tag, ...attr })
        this.children = children
    }

    inside(ctx) {
        return this.children.map(c => c.svg(ctx)).join('\n')
    }
}

class Defs extends MetaGroup {
    constructor({ children, ...attr } = {}) {
        super({ tag: 'defs', children, ...attr })
    }
}

class Style extends MetaElement {
    constructor({ text, ...attr } = {}) {
        super({ tag: 'style', type: 'text/css', ...attr })
        this.text = text
    }

    inside(ctx) {
        return this.text
    }
}

class Effect extends MetaElement {
    constructor({ name, ...attr } = {}) {
        super({ tag: `fe${name}`, ...attr })
        const klass = this.constructor.name.toLowerCase()
        this.result = attr.result ?? `${klass}_${random_hex()}`
    }
}

class Filter extends MetaGroup {
    constructor({ name, effects, ...attr } = {}) {
        super({ tag: 'filter', effects, id: name, ...attr })
    }
}

class DropShadow extends Effect {
    constructor({ dx = 0, dy = 0, blur = 0, color = 'black', ...attr } = {}) {
        super({ dx, dy, stdDeviation: blur, flood_color: color, ...attr })
    }
}

class GaussianBlur extends Effect {
    constructor({ blur = 0, ...attr } = {}) {
        super({ tag: 'GaussianBlur', stdDeviation: blur, ...attr })
    }
}

class MergeNode extends MetaElement {
    constructor({ input, ...attr } = {}) {
        super({ tag: 'feMergeNode', in: input, ...attr })
    }
}

class Merge extends MetaGroup {
    constructor({ effects, ...attr } = {}) {
        const nodes = effects.map(e => new MergeNode({ input: e.result }))
        super({ tag: 'feMerge', nodes, ...attr })
    }
}

//
// text elements
//

function escape_xml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function check_string(children) {
    const child = check_singleton(children)
    if (typeof child !== 'string') {
        throw Error('Must be a string')
    }
    return child
}

class Text extends Element {
    constructor({ children: children0, font_family, font_weight, font_size, color = 'black', offset = [ 0, -0.13 ], ...attr } = {}) {
        const text = check_string(children0)

        // compute text box
        const fargs = { family: font_family, weight: font_weight, size: font_size }
        const [ xoff0, yoff0, width0, height0 ] = text_sizer(text, fargs)

        // get position and size
        const offset0 = div([ xoff0, yoff0 ], height0)
        const offset1 = add(offset0, offset)
        const aspect = width0 / height0

        // pass to element
        super({ tag: 'text', unary: false, aspect, font_family, font_weight, font_size, stroke: color, fill: color, ...attr })
        this.text = escape_xml(text)
        this.offset = offset1
    }

    // because text will always be displayed upright,
    // we need to find the ordered bounds of the text
    // and then offset it by the given offset
    props(ctx) {
        const attr = super.props(ctx)
        const { prect } = ctx
        const [ x0, y0, rx0, ry0 ] = rect_radial(prect)
        const [ xoff, yoff ] = ctx.mapSize(this.offset)

        // get display position
        const [ rx, ry ] = [ abs(rx0), abs(ry0) ]
        const [ x1, y1 ] = [ x0 - rx, y0 + ry ]
        const [ x, y ] = [ x1 + xoff, y1 + yoff ]
        const h0 = 2 * ry

        // get font size
        const { font_size } = this.attr
        const h = font_size ?? h0

        // get adjusted size
        return { x, y, font_size: `${h}px`, ...attr }
    }

    inner(ctx) {
        return this.text
    }
}

class MultiText extends VStack {
    constructor({ children: children0, spacing, align, ...attr }) {
        const children = ensure_array(children0)
        const rows = children.map(t => new Text({ children: t, ...attr}))
        super({ children: rows, spacing, align })
    }
}

class Emoji extends Text {
    constructor({ children: children0, ...attr } = {}) {
        const tag = check_string(children0)
        let text = emoji_table[tag]
        const text_attr = {}
        if (text == null) {
            text = `:${tag}:`
            text_attr.fill = red
            text_attr.stroke = red
        }
        super({ children: text, ...text_attr, ...attr })
    }
}

function get_attributes(elem) {
    return Object.fromEntries(
        Array.from(elem.attributes, ({name, value}) => [name, value])
    )
}

class Latex extends Element {
    constructor({ children: children0, ...attr } = {}) {
        const text = check_string(children0)

        // render with mathjax (or do nothing if mathjax is not available)
        let svg_attr, math, aspect
        if (typeof MathJax !== 'undefined') {
            // render with mathjax
            const output = MathJax.tex2svg(text)
            const svg = output.children[0]

            // strip outer size attributes
            svg.removeAttribute('width')
            svg.removeAttribute('height')

            // get aspect ratio
            const viewBox = svg.getAttribute('viewBox')
            const viewNum = viewBox.split(' ').map(Number)
            const [ width, height ] = viewNum.slice(2)
            aspect = width / height

            // get tag info and inner svg
            svg_attr = get_attributes(svg)
            math = svg.innerHTML
        } else {
            math = text
        }

        // pass to element
        super({ tag: 'svg', unary: false, aspect, ...svg_attr, ...attr })
        this.math = math
    }

    props(ctx) {
        // get context information
        const attr = super.props(ctx)
        const { prect } = ctx
        const [ x0, y0, rx0, ry0 ] = rect_radial(prect)

        // get display position
        const [ rx, ry ] = [ abs(rx0), abs(ry0) ]
        const [ x, y ] = [ x0 - rx, y0 - ry ]
        const h0 = 2 * ry

        // get font size
        const { font_size } = this.attr
        const h = font_size ?? h0
        const w = h * this.spec.aspect

        // get adjusted size
        return { x, y, width: w, height: h, font_size: `${h}px`, ...attr }
    }

    inner(ctx) {
        return `\n${this.math}\n`
    }
}

class TextFrame extends Frame {
    constructor({ children: children0, padding = 0.1, border = 1, spacing = 0.02, align, latex = false, emoji = false, ...attr0 } = {}) {
        const children = ensure_array(children0)
        const [text_attr, attr] = prefix_split(['text'], attr0)

        // generate core elements
        const TextElement = latex ? Latex : emoji ? Emoji : Text
        const maker = s => is_string(s) || is_number(s) ?
            new TextElement({ children: s, ...text_attr }) : s
        const text = children.length > 1 ?
            new VStack({ children: children.map(maker), expand: false, align, spacing }) :
            maker(children[0] ?? '')

        // pass to Group
        super({ children: text, padding, border, align, ...attr })
    }
}

class TitleFrame extends Frame {
    constructor({ children: children0, title, title_size = 0.075, title_fill = 'white', title_offset = 0, title_rounded = 0.1, title_border = 1, adjust = false, padding = 0, margin = 0, border = 1, aspect, ...attr0 } = {}) {
        const child = check_singleton(children0)
        const [title_attr, border_attr0, frame_attr] = prefix_split(['title', 'border'], attr0)
        const border_attr = prefix_add('border', border_attr0)

        // adjust padding for title
        if (title != null && adjust) {
            padding = pad_rect(padding)
            margin = pad_rect(margin)
            const [ pl, pt, pr, pb ] = padding
            const [ ml, mt, mr, mb ] = margin
            padding = [ pl, pt + title_size, pr, pb ]
            margin = [ ml, mt + title_size, mr, mb ]
        }

        // make outer frame
        const frame = new Frame({ children: child, aspect, padding, border: 0 })
        const subs = [ frame ]

        // make optional title box
        if (title != null) {
            const base = title_offset * title_size
            const title_rect = radial_rect([ 0.5, base ], [ 0.0, title_size ])
            const title_box = new TextFrame({ children: title, rect: title_rect, expand: true, fill: title_fill, border: title_border, rounded: title_rounded, ...title_attr })
            subs.push(title_box)
        }

        // apply margin only frame
        const group_aspect = aspect ?? frame.spec.raspect
        const group = new Group({ children: subs, aspect: group_aspect })
        super({ children: group, margin, border, ...border_attr, ...frame_attr })
    }
}

//
// parametric paths
//

 function func_or_scalar(x) {
    if (is_scalar(x)) {
        return () => x
    } else {
        return x
    }
}

// determines actual values given combinations of limits, values, and functions
function sympath({ fx, fy, xlim, ylim, tlim = lim_base, xvals, yvals, tvals, clip = true, N } = {}) {
    fx = func_or_scalar(fx)
    fy = func_or_scalar(fy)

    // determine data size
    const Ns = new Set(
        [ tvals, xvals, yvals ]
        .filter(v => v != null)
        .map(v => v.length)
    )
    if (Ns.size > 1) {
        throw new Error(`Error: data sizes must be in aggreement but got ${Ns}`)
    } else if (Ns.size == 1) {
        N = [...Ns][0]
    } else {
        N = N ?? N_base
    }

    // compute data values
    tvals = tvals ?? linspace(...tlim, N)
    if (fx != null && fy != null) {
        xvals = tvals.map(fx)
        yvals = tvals.map(fy)
    } else if (fy != null) {
        xvals = xvals ?? linspace(...xlim, N)
        yvals = xvals.map(fy)
    } else if (fx != null) {
        yvals = yvals ?? linspace(...ylim, N)
        xvals = yvals.map(fx)
    }

    // clip values
    if (clip) {
        if (xlim != null) {
            const [ xmin, xmax ] = xlim
            xvals = xvals.map(x =>
                (xmin <= x && x <= xmax) ? x : null
            )
        }
        if (ylim != null) {
            const [ ymin, ymax ] = ylim
            yvals = yvals.map(y =>
                (ymin <= y && y <= ymax) ? y : null
            )
        }
    }

    return [ tvals, xvals, yvals ]
}

class SymPath extends Polyline {
    constructor({ fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, clip, N, ...attr } = {}) {
        // compute path values
        const [ tvals1, xvals1, yvals1 ] = sympath({
            fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, clip, N
        })

        // get valid point pairs
        const points = zip(xvals1, yvals1).filter(
            ([ x, y ]) => (x != null) && (y != null)
        )

        // pass to element
        super({ points, ...attr })
    }
}

class SymFill extends Polygon {
    constructor({ fx1, fy1, fx2, fy2, xlim, ylim, tlim, xvals, yvals, tvals, N, ...attr } = {}) {
        // compute point values
        const [tvals1, xvals1, yvals1] = sympath({
            fx: fx1, fy: fy1, xlim, ylim, tlim, xvals, yvals, tvals, N
        })
        const [tvals2, xvals2, yvals2] = sympath({
            fx: fx2, fy: fy2, xlim, ylim, tlim, xvals, yvals, tvals, N
        })

        // get valid point pairs
        const points = [...zip(xvals1, yvals1), ...zip(xvals2, yvals2).reverse()].filter(
            ([x, y]) => (x != null) && (y != null)
        )

        // pass to element
        super({ points, ...attr })
    }
}

class SymPoly extends Polygon {
    constructor({ fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, N, ...attr } = {}) {

        // compute point values
        const [tvals1, xvals1, yvals1] = sympath({
            fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, N
        })

        // get valid point pairs
        const points = zip(xvals1, yvals1)

        // pass to element
        super({ points, ...attr })
    }
}

class SymPoints extends Group {
    constructor({ children: children0, fx, fy, fs, fr, size = 0.01, shape: shape0, xlim, ylim, tlim, xvals, yvals, tvals, N, ...attr } = {}) {
        const shape = ensure_function(shape0 ?? (() => new Dot()))
        const fsize = is_number(size) ? (() => size) : size

        // compute point values
        const [tvals1, xvals1, yvals1] = sympath({
            fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, N
        })

        // make points
        const points = zip(tvals1, xvals1, yvals1)
        const children = enumerate(points).map(([i, [t, x, y]]) => {
            const sh = shape(x, y, t, i)
            const sz = fsize(x, y, t, i)
            sh.spec.rect = radial_rect([x, y], sz)
            return sh
        })

        // pass  to element
        super({ children, clip: false, ...attr })
    }
}

function datapoints({ xvals, yvals, xlim, ylim, N } = {}) {
    if (xvals == null) {
        N = N ?? yvals.length
        xlim = xlim ?? [ 0, N - 1 ]
        xvals = linspace(...xlim, N)
    }
    if (yvals == null) {
        N = N ?? xvals.length
        ylim = ylim ?? [0, N - 1]
        yvals = linspace(...ylim, N)
    }
    return zip(xvals, yvals)
}

function broadcast_arrays(vs, N) {
    return vs.map(v => (v != null) ? ensure_vector(v, N) : null)
}

class DataPath extends Polyline {
    constructor({ xvals, yvals, xlim, ylim, ...attr } = {}) {
        const points = datapoints({ xvals, yvals, xlim, ylim })
        super({ points, ...attr })
    }
}

class DataPoints extends Points {
    constructor({ xvals, yvals, xlim, ylim, ...attr } = {}) {
        const points = datapoints({ xvals, yvals, xlim, ylim })
        super({ points, ...attr })
    }
}

class DataFill extends Polygon {
    constructor({ xvals1, yvals1, xvals2, yvals2, xlim, ylim, ...attr } = {}) {
        // repeat constants
        const N = max(...[ xvals1, yvals1, xvals2, yvals2 ].map(v => v?.length))
        const [ xvals1v, yvals1v, xvals2v, yvals2v ] = broadcast_arrays(
            [ xvals1, yvals1, xvals2, yvals2 ], N
        )

        // make forward-backard shape
        const points1 = datapoints({ xvals: xvals1v, yvals: yvals1v, xlim, ylim, N })
        const points2 = datapoints({ xvals: xvals2v, yvals: yvals2v, xlim, ylim, N })
        const points = [ ...points1, ...points2.reverse() ]

        // pass to pointstring
        super({ points, ...attr })
    }
}

//
// arrows and fields
//


function vector_angle(vector) {
    const [ x, y ] = vector
    return r2d * Math.atan2(y, x)
}

function unit_direc(direc) {
    const theta = is_scalar(direc) ? direc : vector_angle(direc)
    const rad = d2r * theta
    return [ cos(rad), sin(rad) ]
}

// the definition of an direc in non-square aspects is weird?
class ArrowHead extends Element {
    constructor({ direc, arc = 60, base = false, ...attr } = {}) {
        const tag = base ? 'polygon' : 'polyline'
        super({ tag, unary: true, ...attr })
        this.direc = direc
        this.arc = arc
    }

    props(ctx) {
        const attr = super.props(ctx)
        const [ cx, cy, rx, ry ] = rect_radial(ctx.prect)

        // get true angle in aspect
        const unit = unit_direc(this.direc)
        const direc = ctx.mapSize(unit)
        const angle = vector_angle(direc)

        // get arc angles
        const [ arcx, arcy ] = [ -angle - this.arc / 2, -angle + this.arc / 2 ]
        const [ delx, dely ] = [ unit_direc(arcx), unit_direc(arcy) ]

        // get arc points
        const size = 0.5 * (abs(rx) + abs(ry))
        const rad = [ sign(rx) * size, sign(ry) * size ]
        const [ dx1, dy1 ] = mul(delx, rad)
        const [ dx2, dy2 ] = mul(dely, rad)

        // construct triangle points
        const pixels = [
            [ cx - dx1, cy - dy1 ],
            [ cx, cy ],
            [ cx - dx2, cy - dy2 ],
        ]

        // map into pointstring
        const points = pointstring(pixels, ctx.prec)
        return { points, ...attr }
    }
}

class Arrow extends Group {
    constructor({ children: children0, direc: direc0, tail = 0, shape = 'arrow', graph = true, ...attr0 } = {}) {
        const [head_attr, tail_attr, attr] = prefix_split(['head', 'tail'], attr0)

        // baked in shapes
        if (shape == 'circle') {
            shape = (_, a) => new Dot(a)
        } else if (shape == 'arrow') {
            shape = (t, a) => new ArrowHead({ direc: t, ...a })
        } else {
            throw new Error(`Unrecognized arrow shape: ${shape}`)
        }

        // ensure vector direction
        const theta = is_scalar(direc0) ? direc0 : vector_angle(direc0)
        let direc = unit_direc(theta)

        // sort out graph direction
        direc = graph ? mul(direc, [ 1, -1 ]) : direc

        // create head (override with null direction)
        const arrow = shape(theta, head_attr)
        const head_elem = norm(direc, 2) == 0 ? new Dot(head_attr) : arrow

        // create tail
        const tail_direc = direc.map(z => -tail * z)
        const tail_pos = add([0.5, 0.5], tail_direc)
        const tail_elem = new Line({ pos1: [ 0.5, 0.5 ], pos2: tail_pos, ...tail_attr })

        super({ children: [ tail_elem, head_elem ], ...attr })
    }
}

class Field extends Points {
    constructor({ children: children0, points, direcs, marker, size = 0.02, tail = 1, ...attr0 } = {}) {
        marker = marker ?? ((p, d, a) => {
            const arrow = new Arrow({ direc: d, tail, ...a })
            arrow.attr.pos = p
            arrow.attr.rad = size
            return arrow
        })
        const [ marker_attr, attr ] = prefix_split([ 'marker' ], attr0)
        const children = zip(points, direcs).map(([ p, d ]) => marker(p, d, marker_attr))
        super({ children, ...attr })
    }
}

class SymField extends Field {
    constructor({ func, xlim, ylim, N = 10, ...attr } = {}) {
        const points = lingrid(xlim, ylim, N)
        const direcs = points.map(([x, y]) => func(x, y))
        super({ points, direcs, ...attr })
    }
}

//
// networks
//

function get_direction(p1, p2) {
    const [ x1, y1 ] = p1
    const [ x2, y2 ] = p2

    const [ dx, dy ] = [ x2 - x1, y2 - y1 ]
    const [ ax, ay ] = [ abs(dx), abs(dy) ]

    return (dy <= -ax) ? 'n' :
           (dy >=  ax) ? 's' :
           (dx >=  ay) ? 'e' :
           (dx <= -ay) ? 'w' :
           null
}

function norm_direc(direc) {
    return (direc == 'n') ? 'n' :
           (direc == 's') ? 's' :
           (direc == 'e') ? 'e' :
           (direc == 'w') ? 'w' :
           null
}

function anchor_direc(direc) {
    return (direc == 'w') ? [-1, 0 ] :
           (direc == 'e') ? [ 1, 0 ] :
           (direc == 'n') ? [ 0, -1] :
           (direc == 's') ? [ 0, 1 ] :
           null
}

function cubic_spline(x0, x1, d0, d1) {
    const [ a, b, c, d ] = [
        x0,
        d0,
        3 * (x1 - x0) - (2 * d0 + d1),
        -2 * (x1 - x0) + (d0 + d1),
    ]
    return t => a + b * t + c * t**2 + d * t**3
}

class CubicSpline extends SymPath {
    constructor({ pos0, pos1, direc0, direc1, ...attr } = {}) {
        const [ x0, y0 ] = pos0
        const [ x1, y1 ] = pos1
        const [ dx0, dy0 ] = direc0
        const [ dx1, dy1 ] = direc1
        const fx = cubic_spline(x0, x1, dx0, dx1)
        const fy = cubic_spline(y0, y1, dy0, dy1)
        super({ fx, fy, ...attr })
    }
}

class ArrowPath extends Group {
    constructor({ children: children0, pos_beg, pos_end, direc_beg, direc_end, arrow, arrow_beg, arrow_end, arrow_size = 0.03, ...attr0 } = {}) {
        let [ path_attr, arrow_beg_attr, arrow_end_attr, arrow_attr, attr ] = prefix_split(
            [ 'path', 'arrow_beg', 'arrow_end', 'arrow' ], attr0
        )
        arrow_beg = arrow ?? arrow_beg ?? false
        arrow_end = arrow ?? arrow_end ?? true

        // accumulate arguments
        arrow_beg_attr = { ...arrow_attr, ...arrow_beg_attr }
        arrow_end_attr = { ...arrow_attr, ...arrow_end_attr }

        // set default directions (gets normalized later)
        const direc = sub(pos_end, pos_beg)
        direc_beg = direc_beg ?? direc
        direc_end = direc_end ?? direc

        // get unit vectors
        const [ vector_beg, vector_end ] = [ direc_beg, direc_end ].map(unit_direc)
        const [ angle_beg, angle_end ] = [ vector_beg, vector_end ].map(vector_angle)

        // create cubic spline path
        const path = new CubicSpline({ pos0: pos_beg, pos1: pos_end, direc0: vector_beg, direc1: vector_end, ...path_attr })
        const children = [ path ]

        // make arrowheads
        if (arrow_beg) {
            const head_rect = radial_rect(pos_beg, arrow_size)
            const head_beg = new ArrowHead({ direc: 180 - angle_beg, rect: head_rect, ...arrow_beg_attr })
            children.push(head_beg)
        }
        if (arrow_end) {
            const head_rect = radial_rect(pos_end, arrow_size)
            const head_end = new ArrowHead({ direc: -angle_end, rect: head_rect, ...arrow_end_attr })
            children.push(head_end)
        }

        // pass to Group
        super({ children, clip: false, ...attr })
    }
}

// this should provide a rect for positioning
class Node extends Frame {
    constructor({ children: children0, label, pos, rad = 0.1, padding = 0.1, border = 1, rounded = 0.05, ...attr0 } = {}) {
        const child = ensure_singleton(children0)
        const [ text_attr, attr ] = prefix_split([ 'text' ], attr0)

        // make frame: handle text / element / list
        const text = is_element(child) ? child : new MultiText({ children: child, ...text_attr })

        // pass to Frame
        super({ children: text, padding, border, rounded, ...attr })
        this.label = label
        this.pos = pos
        this.rad = rad
    }

    get_center() {
        const { rect } = this.spec
        return rect_center(rect)
    }

    get_anchor(direc) {
        const { rect } = this.spec
        const [ xmin, ymin, xmax, ymax ] = rect
        const [ xmid, ymid ] = rect_center(rect)
        return (direc == 'n') ? [ xmid, ymin ] :
               (direc == 's') ? [ xmid, ymax ] :
               (direc == 'e') ? [ xmax, ymid ] :
               (direc == 'w') ? [ xmin, ymid ] :
               null
    }
}

class Edge extends Element {
    constructor({ beg, end, pos_beg, pos_end, ...attr } = {}) {
        super(attr)
        this.beg = beg
        this.end = end
        this.pos_beg = pos_beg
        this.pos_end = pos_end
    }
}

class Network extends Group {
    constructor({ children: children0, ...attr } = {}) {
        // collect nodes and edges
        const nodes = children0.filter(c => c instanceof Node)
        const edges = children0.filter(c => c instanceof Edge)
        const nmap = new Map(nodes.map(n => [ n.label, n ]))

        // map node rects
        nodes.forEach(n => {
            const rect = radial_rect(n.pos, n.rad)
            n.spec.rect = rect
        })

        // create arrow paths from edges
        const paths = edges.map(e => {
            const node1 = nmap.get(e.beg)
            const node2 = nmap.get(e.end)
            const center1 = node1.get_center()
            const center2 = node2.get_center()
            const line1 = get_direction(center1, center2)
            const line2 = get_direction(center2, center1)
            const anchor1 = norm_direc(e.pos_beg ?? line1)
            const anchor2 = norm_direc(e.pos_end ?? line2)
            const pos_beg = node1.get_anchor(anchor1)
            const pos_end = node2.get_anchor(anchor2)
            const direc1 = anchor_direc(anchor1)
            const direc2 = mul(anchor_direc(anchor2), -1)
            return new ArrowPath({ pos_beg, pos_end, direc_beg: direc1, direc_end: direc2, ...e.attr })
        })

        console.log(paths)

        // pass to Graph
        super({ children: [...nodes, ...paths], clip: false, ...attr })
    }
}

//
// bar components
//

class MultiBar extends Stack {
    constructor({ children: children0, direc, lengths, ...attr0 } = {}) {
        // get standardized direction
        direc = ensure_orient(direc);
        lengths = is_scalar(lengths) ? [lengths] : lengths;

        // handle lengths cases
        const boxes = lengths.map(lc => is_scalar(lc) ? [lc, null] : lc);

        // make stacked bars
        const total = sum(boxes.map(([l, c]) => l));
        const children = boxes.map(([l, c]) => [new Rect({ fill: c }), l / total]);

        // pass to bar
        super({ children, ...attr0 });
    }
}

class VMultiBar extends MultiBar {
    constructor(attr) {
        super({ direc: 'v', ...attr });
    }
}

class HMultiBar extends MultiBar {
    constructor(attr) {
        super({ direc: 'h', ...attr });
    }
}

function make_bar(i, b, attr) {
    let {color, ...attr0} = attr ?? {};
    color = color ?? 'lightgray';
    let [h, c] = is_scalar(b) ? [b, null] : b;
    c = c ?? new RoundedRect({ fill: color, ...attr0 });
    return [c, [i, h]];
}

class Bars extends Group {
    constructor({ children: children0, bars, direc = 'v', width = 0.9, zero = 0, ...attr } = {}) {
        direc = ensure_orient(direc);

        // make individual bars
        const [elems, poses] = zip(...bars.map((b, i) => make_bar(i, b, attr)));
        const rects = poses.map(([x, y]) =>
            direc == 'v' ? [x-width/2, zero, x+width/2, y] : [zero, x-width/2, y, x+width/2]
        );
        const children = zip(elems, rects);

        // pass to Group
        super({ children });
    }
}

//
// plotting elements
//

function ensure_tick(tick, prec = 2) {
    const [ pos, str ] = is_scalar(tick) ? [tick, tick] : tick
    return new Text({ children: rounder(str, prec), tick: pos })
}

function invert_align(align) {
    return align == 'left' ? 'right' :
           align == 'right' ? 'left' :
           align == 'bottom' ? 'top' :
           align == 'top' ? 'bottom' :
           align
}

function invert_direc(direc) {
    return direc == 'v' ? 'h' :
           direc == 'h' ? 'v' :
           direc
}

class Scale extends Group {
    constructor({ children: children0, direc, locs, ...attr } = {}) {
        direc = ensure_orient(direc)

        // make tick lines
        const tick_dir = invert_direc(direc)
        const children = locs.map(t => {
            const rect = direc == 'v' ? [0, t, 1, t] : [t, 0, t, 1]
            return new UnitLine({ direc: tick_dir, rect, expand: true })
        })

        // set coordinate system
        super({ children, clip: false, ...attr })
    }
}

class VScale extends Scale {
    constructor(attr) {
        super({ direc: 'v', ...attr })
    }
}

class HScale extends Scale {
    constructor(attr) {
        super({ direc: 'h', ...attr })
    }
}

// label elements must have an aspect to properly size them
class Labels extends Group {
    constructor({ children, direc, locs, align = 'center', prec = 2, ...attr } = {}) {
        direc = ensure_orient(direc)

        // make children with tick data (if given)
        if (locs != null) children = locs.map(x => ensure_tick(x, prec))

            // anchor vertical ticks to unit-aspect boxes
        if (direc == 'v') {
            const talign = invert_align(align)
            children = children.map(c => {
                const { tick } = c.attr
                return new Anchor({ children: c, aspect: 1, side: talign, tick: tick })
            })
        }

        // place tick boxes using expanded lines
        children.forEach(c => {
            const { tick: loc } = c.attr
            c.spec.rect = direc == 'v' ? [0, loc, 1, loc] : [loc, 0, loc, 1]
            c.spec.expand = true
        })

        // pass to Group
        super({ children, clip: false, ...attr })
    }
}

class HLabels extends Labels {
    constructor(attr) {
        super({ direc: 'h', ...attr })
    }
}

class VLabels extends Labels {
    constructor(attr) {
        super({ direc: 'v', ...attr })
    }
}

function get_lim(direc, coord) {
    const [ xlo, ylo, xhi, yhi ] = coord
    return direc == 'v' ? [ ylo, yhi ] : [ xlo, xhi ]
}

function join_lims({ v = lim_base, h = lim_base } = {}) {
    const [ vlo, vhi ] = v
    const [ hlo, hhi ] = h
    return [ hlo, vlo, hhi, vhi ]
}

function get_tick_lim(lim) {
    if (lim == 'inner') {
        return [0, 0.5]
    } else if (lim == 'outer') {
        return [0.5, 1]
    } else if (lim == 'both') {
        return [0, 1]
    } else if (lim == 'none') {
        return [0, 0]
    } else {
        return lim
    }
}

function ensure_axispos(label_pos) {
    if (label_pos == 'outer') {
        return 'outer'
    } else if (label_pos == 'inner') {
        return 'inner'
    } else if (label_pos == 'both') {
        return 'both'
    } else if (label_pos == 'none') {
        return 'none'
    } else {
        throw new Error(`Unrecognized label position: ${label_pos}`)
    }
}

function invert_axispos(label_pos) {
    if (label_pos == 'outer') {
        return 'inner'
    } else if (label_pos == 'inner') {
        return 'outer'
    } else if (label_pos == 'both') {
        return 'both'
    } else if (label_pos == 'none') {
        return 'none'
    } else {
        throw new Error(`Unrecognized label position: ${label_pos}`)
    }
}

// this is designed to be plotted directly
// this takes a nested coord approach, not entirely sure about that
class Axis extends Group {
    constructor({ children, lim = lim_base, direc, ticks, tick_pos = 'both', label_pos = 'outer', tick_size = tick_size_base, tick_label_size = tick_label_size_base, tick_label_offset = tick_label_offset_base, prec = 2, ...attr0 } = {}) {
        direc = ensure_orient(direc)
        tick_pos = ensure_axispos(tick_pos)
        label_pos = ensure_axispos(label_pos)
        const [label_attr, tick_attr, line_attr, attr] = prefix_split(['label', 'tick', 'line'], attr0)

        // get tick and label limits
        const tick_lim = get_tick_lim(tick_pos)
        const label_align = (direc == 'v') ? (label_pos == 'outer' ? 'right' : 'left') : 'center'
        const label_base = (label_pos == 'outer') ? 1 + tick_label_offset : -tick_label_offset - tick_label_size
        const label_lim = [ label_base, label_base + tick_label_size ]

        // set up one-sides coordinate system
        const idirec = invert_direc(direc)
        const coord = join_lims({ [direc]: lim })
        const scale_rect = join_lims({ [idirec]: tick_lim })
        const label_rect = join_lims({ [idirec]: label_lim })

        // extract tick information
        if (ticks != null) {
            ticks = is_scalar(ticks) ? linspace(...lim, ticks) : ticks
            children = ticks.map(t => ensure_tick(t, prec))
        }
        const locs = children.map(c => c.attr.tick)

        // accumulate children
        const cline = new UnitLine({ direc, ...line_attr })
        const scale = new Scale({ direc, locs, rect: scale_rect, coord, ...tick_attr })
        const label = new Labels({ children, direc, align: label_align, rect: label_rect, coord, ...label_attr })

        // pass to Group
        super({ children: [ cline, scale, label ], clip: false, ...attr })
        this.locs = locs
    }
}

class HAxis extends Axis {
    constructor(attr) {
        super({ direc: 'h', ...attr })
    }
}

class VAxis extends Axis {
    constructor(attr) {
        super({ direc: 'v', ...attr })
    }
}

class BoxLabel extends Attach {
    constructor({ children: children0, ...attr0 } = {}) {
        const text = check_singleton(children0)
        const [text_attr, attr] = prefix_split(['text'], attr0)
        const label = is_element(text) ? text : new Text({ children: text, ...text_attr })
        super({ children: label, ...attr })
    }
}

class Mesh extends Scale {
    constructor({ direc, locs, lim = lim_base, opacity = 0.2, ...attr } = {}) {
        const coord = join_lims({ [direc]: lim })
        super({ direc, locs, coord, opacity, ...attr })
    }
}

class HMesh extends Mesh {
    constructor(attr) {
        super({ direc: 'h', ...attr })
    }
}

class VMesh extends Mesh {
    constructor(attr) {
        super({ direc: 'v', ...attr })
    }
}

function make_legendbadge(c, attr) {
    if (is_string(c)) {
        attr = {stroke: c, ...attr}
    } else if (is_object(c)) {
        attr = {...c, ...attr}
    } else {
        throw new Error(`Unrecognized legend badge specification: ${c}`)
    }
    return new HLine({ aspect: 1, ...attr })
}

function make_legendlabel(s) {
    return new Text({ children: s })
}

class Legend extends Frame {
    constructor({ children: children0, lines, vspacing = 0.1, hspacing = 0.025, ...attr0 } = {}) {
        const [ badge_attr, attr ] = prefix_split([ 'badge' ], attr0)

        // construct legend badges and labels
        const [badges, labels] = zip(...lines)
        badges = badges.map(b => is_element(b) ? b : make_legendbadge(b, badge_attr))
        labels = labels.map(t => is_element(t) ? t : make_legendlabel(t))

        // construct legend grid
        const bs = new VStack({ children: badges, spacing: vspacing })
        const ls = new VStack({ children: labels, expand: false, align: 'left', spacing: vspacing })
        const vs = new HStack({ children: [bs, ls], spacing: hspacing })

        // pass to Frame
        super({ children: vs, ...attr })
    }
}

class Note extends Place {
    constructor({ children: children0, latex = false, ...attr0 } = {}) {
        const text = check_singleton(children0)
        const [ text_attr, attr ] = prefix_split([ 'text' ], attr0)
        const Maker = latex ? Latex : Text
        const label = new Maker({ children: text, ...text_attr })
        super({ children: label, ...attr })
    }
}

function expand_limits(lim, fact) {
    const [ lo, hi ] = lim
    const ex = fact * (hi - lo)
    return [ lo - ex, hi + ex ]
}

// find minimal containing limits
function outer_limits(children, padding=0) {
    if (children.length == 0) return null
    const [ xpad, ypad ] = ensure_vector(padding, 2)
    const rects = children.map(c => c.bounds).filter(z => z != null)
    if (rects.length == 0) return null
    const [ xmin0, ymin0, xmax0, ymax0 ] = merge_rects(...rects)
    const [ xmin, xmax ] = expand_limits([ xmin0, xmax0 ], xpad)
    const [ ymin, ymax ] = expand_limits([ ymin0, ymax0 ], ypad)
    return [ xmin, ymin, xmax, ymax ]
}

class Graph extends Group {
    constructor({ children: children0, coord, aspect, padding = 0, flex = false, flip = true, ...attr } = {}) {
        const children = ensure_array(children0)

        // determine coordinate limits and aspect
        const coord0 = outer_limits(children, padding) ?? coord_base
        let [ xmin, ymin, xmax, ymax ] = coord ?? coord0
        if (flip) [ ymin, ymax ] = [ ymax, ymin ]
        coord = [ xmin, ymin, xmax, ymax ]
        if (!flex && aspect == null) aspect = rect_aspect(coord)

        // set the coordinate system for all children
        children.forEach(e => e.spec.coord = coord)

        // pass to Group
        super({ children, aspect, ...attr })
    }
}

class Plot extends Group {
    constructor({
        children: children0, xlim, ylim, xaxis = true, yaxis = true, xticks = num_ticks_base, yticks = num_ticks_base, grid, xgrid, ygrid, xlabel, ylabel, title, tick_size = tick_size_base, label_size, label_offset, label_align, title_size = title_size_base, title_offset = title_offset_base, xlabel_size, ylabel_size, xlabel_offset, ylabel_offset, xlabel_align, ylabel_align, axis_tick_pos = 'both', axis_tick_label_pos = 'outer', padding, border, fill, prec, aspect, flex = false, ...attr0
    } = {}) {
        const elems = ensure_array(children0)
        aspect = flex ? null : (aspect ?? 'auto')
        const [ xtick_size, ytick_size ] = ensure_vector(tick_size, 2)

        // some advanced piping
        let [
            xaxis_attr, yaxis_attr, axis_attr, xgrid_attr, ygrid_attr, grid_attr, xlabel_attr,
            ylabel_attr, label_attr, title_attr, border_attr, attr
        ] = prefix_split([
            'xaxis', 'yaxis', 'axis', 'xgrid', 'ygrid', 'grid', 'xlabel', 'ylabel', 'label', 'title', 'border'
        ], attr0)
        xaxis_attr = { ...axis_attr, ...xaxis_attr }
        yaxis_attr = { ...axis_attr, ...yaxis_attr }
        xgrid_attr = { ...grid_attr, ...xgrid_attr }
        ygrid_attr = { ...grid_attr, ...ygrid_attr }
        xlabel_attr = { ...label_attr, ...xlabel_attr }
        ylabel_attr = { ...label_attr, ...ylabel_attr }

        // determine coordinate limits
        const [ xmin0, ymin0, xmax0, ymax0 ] = outer_limits(elems, padding) ?? coord_base
        xlim = xlim ?? [ xmin0, xmax0 ]
        ylim = ylim ?? [ ymin0, ymax0 ]

        // determine coordinate system
        const [ xmin, xmax ] = xlim
        const [ ymin, ymax ] = ylim
        const coord = [ xmin, ymin, xmax, ymax ]
        aspect = (aspect == 'auto') ? rect_aspect(coord) : aspect

        // collect axis elements
        const bg_elems = []
        const fg_elems = []

        // default xaxis generation
        if (xaxis === true) {
            const tick_pos = invert_axispos(axis_tick_pos)
            const label_pos = invert_axispos(axis_tick_label_pos)
            const xaxis_rect = join_lims({ h: xlim, v: [ ymin - xtick_size, ymin + xtick_size ] })
            xaxis = new HAxis({ ticks: xticks, lim: xlim, rect: xaxis_rect, tick_pos, label_pos, ...xaxis_attr })
            fg_elems.push(xaxis)
        } else if (xaxis === false) {
            xaxis = null
        }

        // default yaxis generation
        if (yaxis === true) {
            const tick_pos = invert_axispos(axis_tick_pos)
            const label_pos = invert_axispos(axis_tick_label_pos)
            const yaxis_rect = join_lims({ h: [ xmin - ytick_size, xmin + ytick_size ], v: ylim })
            yaxis = new VAxis({ ticks: yticks, lim: ylim, rect: yaxis_rect, tick_pos, label_pos, ...yaxis_attr })
            fg_elems.push(yaxis)
        } else if (yaxis === false) {
            yaxis = null
        }

        // fill background
        if (border != null || fill != null) {
            border = (border === true) ? 1 : border ?? 0
            border = new Rect({ stroke_width: border, fill, ...border_attr })
            bg_elems.push(border)
        }

        // automatic grid path
        if (grid === true || xgrid === true) {
            const locs = is_array(xgrid) ? xgrid : (xaxis != null) ? xaxis.locs : null
            xgrid = new VMesh({ locs, lim: xlim, ...xgrid_attr })
            bg_elems.push(xgrid)
        } else {
            xgrid = null
        }
        if (grid === true || ygrid === true) {
            const locs = is_array(ygrid) ? ygrid : (yaxis != null) ? yaxis.locs : null
            ygrid = new HMesh({ locs, lim: ylim, ...ygrid_attr })
            bg_elems.push(ygrid)
        } else {
            ygrid = null
        }

        // create graph from core elements
        const bg_group = new Group({ children: bg_elems, clip: false })
        const fg_group = new Group({ children: fg_elems, clip: false })
        const elems1 = [ bg_group, ...elems, fg_group ].filter(z => z != null)
        const graph = new Graph({ children: elems1, coord, aspect, flex })
        const children = [ graph ]

        // sort out label size and offset
        if (xlabel != null || ylabel != null) {
            label_size = label_size ?? label_size_base
            const [ xlabelsize, ylabelsize ] = aspect_invariant(label_size, aspect)
            xlabel_size = xlabel_size ?? xlabelsize
            ylabel_size = ylabel_size ?? ylabelsize

            label_offset = label_offset ?? label_offset_base
            const [ xlabeloffset, ylabeloffset ] = aspect_invariant(label_offset, aspect)
            xlabel_offset = xlabel_offset ?? xlabeloffset
            ylabel_offset = ylabel_offset ?? ylabeloffset

            label_align = label_align ?? 'center'
            xlabel_align = xlabel_align ?? label_align
            ylabel_align = ylabel_align ?? label_align
        }

        // optional axis labels
        if (xlabel != null) {
            xlabel = new BoxLabel({ children: xlabel, side: 'bottom', size: xlabel_size, offset: xlabel_offset, align: xlabel_align, ...xlabel_attr })
            children.push(xlabel)
        }
        if (ylabel != null) {
            const ylabel_text = new Text({ children: ylabel, ...ylabel_attr, rotate: -90 })
            ylabel = new BoxLabel({ children: ylabel_text, side: 'left', size: ylabel_size, offset: ylabel_offset, align: ylabel_align, ...ylabel_attr })
            children.push(ylabel)
        }

        // optional plot title
        if (title != null) {
            title = new BoxLabel({ children: title, side: 'top', size: title_size, offset: title_offset, ...title_attr })
            children.push(title)
        }

        // pass to Group
        super({ children, aspect, clip: false, ...attr })
    }
}

//
// Images
//

class Image extends Element {
    constructor(href, args) {
        const attr = args ?? {}
        const attr1 = { href, ...attr }
        super('image', true, attr1)
    }

    props(ctx) {
        const attr = super.props(ctx)
        const prect = ctx.mapRect()
        const [ x, y, w, h ] = rect_radial(prect)
        return { x, y, width: w, height: h, ...attr }
    }
}

//
// scripting
//

const VALS = [
    Context, Element, Group, Svg, Defs, Style, Frame, Stack, VStack, HStack, Grid, Place, Flip, VFlip, HFlip, Anchor, Attach, Points, Absolute, Spacer, Ray, Line, UnitLine, HLine, VLine, Rect, RoundedRect, Square, Ellipse, Circle, Dot, Polyline, Polygon, Path, Command, MoveCmd, LineCmd, ArcCmd, CornerCmd, Arc, Triangle, Text, MultiText, Emoji, Latex, TextFrame, TitleFrame, Arrow, Field, SymField, ArrowHead, ArrowPath, Node, Edge, Network, SymPath, SymFill, SymPoly, SymPoints, DataPath, DataPoints, DataFill, VMultiBar, HMultiBar, Bars, Scale, VScale, HScale, Labels, VLabels, HLabels, Axis, HAxis, VAxis, BoxLabel, Mesh, Graph, Plot, Legend, Note, Filter, Effect, DropShadow, Image, range, linspace, enumerate, repeat, meshgrid, lingrid, hexToRgba, palette, gzip, zip, reshape, split, concat, sum, prod, exp, log, sin, cos, min, max, abs, pow, sqrt, floor, ceil, round, atan, norm, clamp, mask, rescale, sigmoid, logit, smoothstep, rounder, random, uniform, normal, cumsum, pi, phi, r2d, d2r, none, blue, red, green, yellow, purple, gray, radial_rect
]
const KEYS = VALS.map(g => g.name)

//
// exports
//

export {
    KEYS, VALS, Context, Element, Group, Svg, Defs, Style, Frame, Stack, VStack, HStack, Grid, Place, Flip, VFlip, HFlip, Anchor, Attach, Points, Absolute, Spacer, Ray, Line, UnitLine, HLine, VLine, Rect, RoundedRect, Square, Ellipse, Circle, Dot, Polyline, Polygon, Path, Command, MoveCmd, LineCmd, ArcCmd, CornerCmd, Arc, Triangle, Text, MultiText, Emoji, Latex, TextFrame, TitleFrame, Arrow, Field, SymField, ArrowHead, ArrowPath, Node, Edge, Network, SymPath, SymFill, SymPoly, SymPoints, DataPath, DataPoints, DataFill, VMultiBar, HMultiBar, Bars, Scale, VScale, HScale, Labels, VLabels, HLabels, Axis, HAxis, VAxis, BoxLabel, Mesh, Graph, Plot, Legend, Note, Filter, Effect, DropShadow, Image, range, linspace, enumerate, repeat, meshgrid, lingrid, hexToRgba, palette, gzip, zip, reshape, split, concat, sum, prod, exp, log, sin, cos, min, max, abs, pow, sqrt, floor, ceil, round, atan, norm, clamp, mask, rescale, sigmoid, logit, smoothstep, rounder, random, uniform, normal, cumsum, pi, phi, r2d, d2r, none, blue, red, green, yellow, purple, gray, is_string, is_array, is_object, is_function, is_element
}
