// gum.js

import { emoji_table } from './emoji.js';

//
// defaults
//

// namespace
let ns_svg = 'http://www.w3.org/2000/svg';

// sizing
let size_base = 500;
let rect_base = [0, 0, size_base, size_base];
let coord_base = [0, 0, 1, 1];
let prec_base = 2;

// fonts
let font_family_base = 'IBMPlexSans';
let font_weight_base = 100;
let font_size_base = 12;

// plot defaults
let num_ticks_base = 5;
let tick_size_base = 0.025;
let tick_label_size_base = 2.0;
let tick_label_offset_base = 0.5;
let label_size_base = 0.06;
let label_offset_base = 0.15;
let title_size_base = 0.1;
let title_offset_base = 0.1;
let limit_base = [0, 1];
let N_base = 100;

// default styling
let svg_props_base = {
    stroke: 'black',
    fill: 'none',
    font_family: font_family_base,
    font_weight: font_weight_base,
};

// canvas text sizer
function canvas_text_sizer(ctx, text, args) {
    let {family, weight, size, actual} = args ?? {};
    family = family ?? font_family_base;
    weight = weight ?? font_weight_base;
    size = size ?? font_size_base;
    actual = actual ?? false;

    ctx.font = `${weight} ${size}px ${family}`;
    let met = ctx.measureText(text);

    let x, y, w, h;
    if (actual) {
        x = -met.actualBoundingBoxLeft;
        y = -met.actualBoundingBoxDescent;
        w = met.actualBoundingBoxRight - x;
        h = met.actualBoundingBoxAscent - y;
    } else {
        x = 0;
        y = 0;
        w = met.width;
        h = size;
    }

    return [x, y, w, h];
}

// try for browser environment
let text_sizer = null;
try {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    text_sizer = function(text, args) {
        return canvas_text_sizer(ctx, text, args);
    }
} catch (error) {
    // console.log(error);
}

//
// array utils
//

function* gzip(...iterables) {
    if (iterables.length == 0) {
        return;
    }
    let iterators = iterables.map(i => i[Symbol.iterator]());
    while (true) {
        let results = iterators.map(iter => iter.next());
        if (results.some(res => res.done)) {
            return;
        } else {
            yield results.map(res => res.value);
        }
    }
}

function zip(...iterables) {
    return [...gzip(...iterables)];
}

function reshape(arr, shape) {
    let [n, m] = shape;
    let ret = [];
    for (let i = 0; i < n; i++) {
        ret.push(arr.slice(i*m, (i+1)*m));
    }
    return ret;
}

function split(arr, len) {
    let n = Math.ceil(arr.length / len);
    return reshape(arr, [n, len]);
}

function concat(arrs) {
    return arrs.flat();
}

//
// vector utils
//

function sum(arr) {
    arr = arr.filter(v => v != null);
    return arr.reduce((a, b) => a + b, 0);
}

function prod(arr) {
    arr = arr.filter(v => v != null);
    return arr.reduce((a, b) => a * b, 1);
}

function mean(arr) {
    return sum(arr)/arr.length;
}

function all(arr) {
    return arr.reduce((a, b) => a && b);
}

function any(arr) {
    return arr.reduce((a, b) => a || b);
}

function add(arr1, arr2) {
    return zip(arr1, arr2).map(([a, b]) => a + b);
}

function sub(arr1, arr2) {
    return zip(arr1, arr2).map(([a, b]) => a - b);
}

function mul(arr1, arr2) {
    return zip(arr1, arr2).map(([a, b]) => a * b);
}

function div(arr1, arr2) {
    return zip(arr1, arr2).map(([a, b]) => a / b);
}

function multiply(arr, scalar) {
    return arr.map(x => x*scalar);
}

function divide(arr, scalar) {
    return arr.map(x => x/scalar);
}

function addition(arr, scalar) {
    return arr.map(x => x + scalar);
}

function subtract(arr, scalar) {
    return arr.map(x => x - scalar);
}

function cumsum(arr, first) {
    let sum = 0;
    let ret = arr.map(x => sum += x);
    return (first ?? true) ? [0, ...ret.slice(0, -1)] : ret;
}

function norm(vals, degree) {
    degree = degree ?? 1;
    return sum(vals.map(v => v**degree))**(1/degree);
}

function normalize(vals, degree) {
    degree = degree ?? 1;
    let mag = norm(vals, degree);
    return (mag == 0) ? vals.map(v => 0) : vals.map(v => v/mag);
}

function range(i0, i1, step) {
    step = step ?? 1;
    [i0, i1] = (i1 === undefined) ? [0, i0] : [i0, i1];
    let n = floor((i1-i0)/step);
    return [...Array(n).keys()].map(i => i0 + step*i);
}

function linspace(x0, x1, n) {
    if (n == 1) { return [0.5*(x0+x1)]; };
    let step = (x1-x0)/(n-1);
    return [...Array(n).keys()].map(i => x0 + step*i);
}

function enumerate(x) {
    let n = x.length;
    let idx = range(n);
    return zip(idx, x);
}

function repeat(x, n) {
    return Array(n).fill(x);
}

function padvec(vec, len, val) {
    if (vec.length >= len) return vec;
    let m = len - vec.length;
    return [...vec, ...repeat(val, m)];
}

function meshgrid(x, y) {
    return x.flatMap(xi => y.map(yi => [xi, yi]));
}

function lingrid(xlim, ylim, N) {
    if (N >= 100) throw new Error('N is restricted to be less than 100');
    let [Nx, Ny] = ensure_vector(N, 2);
    let xgrid = linspace(...xlim, Nx);
    let ygrid = linspace(...ylim, Ny);
    return meshgrid(xgrid, ygrid);
}

//
// object utils
//

function map_object(obj, fn) {
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, fn(v)])
    );
}

function filter_object(obj, fn) {
    return Object.fromEntries(
        Object.entries(obj).filter(([k, v]) => fn(v))
    );
}

//
// type utils
//

function ensure_vector(x, n) {
    if (!is_array(x)) {
        return range(n).map(i => x);
    } else {
        return x;
    }
}

function ensure_function(f) {
    if (typeof(f) == 'function') {
        return f;
    } else {
        return () => f;
    }
}

function string_to_int(s) {
    return (s != null) ? parseInt(s) : null;
}

function is_scalar(x) {
    return (
        (typeof(x) == 'number') ||
        (typeof(x) == 'object' && (
            (x.constructor.name == 'Number') ||
            (x.constructor.name == 'NamedNumber')
        ))
    );
}

function is_string(x) {
    return typeof(x) == 'string';
}

function is_number(x) {
    return typeof(x) == 'number';
}

function is_object(x) {
    return typeof(x) == 'object';
}

function is_array(x) {
    return Array.isArray(x);
}

function is_element(x) {
    return x instanceof Element;
}

function is_metaelement(x) {
    return x instanceof MetaElement;
}

//
// core math
//

// to be used in functions
class NamedNumber extends Number {
    constructor(name, value) {
        super(value);
        this.name = name;
    }
}

class NamedString extends String {
    constructor(name, value) {
        super(value);
        this.name = name;
    }
}

// functions
let exp = Math.exp;
let log = Math.log;
let sin = Math.sin;
let cos = Math.cos;
let tan = Math.tan;
let abs = Math.abs;
let pow = Math.pow;
let sqrt = Math.sqrt;
let sign = Math.sign;
let floor = Math.floor;
let ceil = Math.ceil;
let round = Math.round;
let atan = Math.atan;
let isNan = Number.isNaN;
let isInf = x => !Number.isFinite(x);

// null on empty
function min(...vals) {
    vals = vals.filter(v => v != null);
    return (vals.length > 0) ? Math.min(...vals) : null;
}
function max(...vals) {
    vals = vals.filter(v => v != null);
    return (vals.length > 0) ? Math.max(...vals) : null;
}

function clamp(x, lim) {
    let [lo, hi] = lim;
    return max(lo, min(x, hi));
}

function mask(x, lim) {
    let [lo, hi] = lim;
    return (x >= lo && x <= hi) ? x : null;
}

function rescale(x, lim) {
    let [lo, hi] = lim;
    return (x-lo)/(hi-lo);
}

function sigmoid(x) {
    return 1/(1+exp(-x));
}

function logit(p) {
    return log(p/(1-p));
}

function smoothstep(x, lim) {
    let [lo, hi] = lim ?? [0, 1];
    let t = clamp((x-lo)/(hi-lo), [0, 1]);
    return t*t*(3 - 2*t);
}

// constants
let e = new NamedNumber('e', Math.E);
let pi = new NamedNumber('pi', Math.PI);
let phi = new NamedNumber('phi', (1+sqrt(5))/2);
let r2d = new NamedNumber('r2d', 180/Math.PI);
let d2r = new NamedNumber('d2r', Math.PI/180);
let blue = new NamedString('blue', '#1e88e5');
let red = new NamedString('red', '#ff0d57');
let green = new NamedString('green', '#4caf50');

//
// random number generation
//

let random = Math.random;

function uniform(lo, hi) {
    return lo + (hi-lo)*random();
}

// Standard Normal variate using Box-Muller transform.
function normal(mean, stdv) {
    mean = mean ?? 0;
    stdv = stdv ?? 1;
    let [u, v] = [1 - random(), random()];
    let [r, t] = [sqrt(-2*log(u)), 2*pi*v];
    let [a, b] = [r*cos(t), r*sin(t)];
    return [a, b].map(x => mean + stdv*x);
}

//
// coordinate utils
//

// convenience mapper for rectangle positions
function pos_rect(r) {
    if (r == null) {
        return coord_base;
    } else if (is_scalar(r)) {
        return [0, 0, r, r];
    } else if (r.length == 2) {
        let [rx, ry] = r;
        return [0, 0, rx, ry];
    } else {
        return r;
    }
}

function pad_rect(p) {
    if (p == null) {
        return coord_base;
    } else if (is_scalar(p)) {
        return [p, p, p, p];
    } else if (p.length == 2) {
        let [px, py] = p;
        return [px, py, px, py];
    } else {
        return p;
    }
}

// map padding/margin into internal boxes
function map_padmar(p, m, a) {
    let [pl, pt, pr, pb] = p;
    let [ml, mt, mr, mb] = m;
    let [pw, ph] = [pl+1+pr, pt+1+pb];
    let [tw, th] = [ml+pw+mr, mt+ph+mb];
    let crect = [(ml+pl)/tw, (mt+pt)/th, 1-(mr+pr)/tw, 1-(mb+pb)/th];
    let brect = [ml/tw, mt/th, 1-mr/tw, 1-mb/th];
    let basp = (a != null) ? a*(pw/ph) : null;
    let tasp = (a != null) ? a*(tw/th) : null;
    return [crect, brect, basp, tasp];
}

function rad_rect(p, r0) {
    let x, y, r, rx, ry;
    if (p.length == 1) {
        [r, ] = p;
        [x, y] = [0.5, 0.5];
        [rx, ry] = [r, r];
    } else if (p.length == 2) {
        [x, y] = p;
        [rx, ry] = ensure_vector(r0, 2);
    } else if (p.length == 3) {
        [x, y, r] = p;
        [rx, ry] = [r, r];
    } else if (p.length == 4) {
        [x, y, rx, ry] = p;
    }
    return [x-rx, y-ry, x+rx, y+ry];
}

function merge_rects(...rects) {
    let [xa, ya, xb, yb] = zip(...rects);
    let [xs, ys] = [[...xa, ...xb], [...ya, ...yb]];
    return [
        min(...xs), min(...ys), max(...xs), max(...ys)
    ];
}

function merge_points(...points) {
    let [xs, ys] = zip(...points);
    return [
        min(...xs), min(...ys), max(...xs), max(...ys)
    ];
}

function rect_dims(rect) {
    let [xa, ya, xb, yb] = rect;
    let [w, h] = [xb - xa, yb - ya];
    return [abs(w), abs(h)];
}

function rect_center(rect) {
    let [xa, ya, xb, yb] = rect;
    return [(xa + xb)/2, (ya + yb)/2];
}

function rect_aspect(rect) {
    let [w, h] = rect_dims(rect);
    return abs(w/h);
}

function aspect_invariant(value, aspect, alpha) {
    aspect = aspect ?? 1;
    alpha = alpha ?? 0.5;

    let wfact = aspect**alpha;
    let hfact = aspect**(1-alpha);

    if (is_scalar(value)) {
        value = [value, value];
    }

    if (value.length == 2) {
        let [vw, vh] = value;
        return [vw*wfact, vh/hfact];
    } else if (value.length == 4) {
        let [vl, vt, vr, vb] = value;
        return [vl*wfact, vt/hfact, vr*wfact, vb/hfact];
    }
}

//
// attributes
//

function prefix_split(pres, attr) {
    let attr1 = {...attr};
    let pres1 = pres.map(p => `${p}_`);
    let out = pres.map(p => Object());
    let keys = Object.keys(attr).map(k => {
        pres.forEach((p, i) => {
            if (k.startsWith(pres1[i])) {
                let k1 = k.slice(p.length+1);
                out[i][k1] = attr1[k];
                delete attr1[k];
            }
        });
    });
    return [...out, attr1];
}

function prefix_add(pre, attr) {
    return Object.fromEntries(
        Object.entries(attr).map(([k, v]) => [`${pre}_${k}`, v])
    );
}

//
// string formatters
//

function demangle(k) {
    return k.replace('_', '-');
}

function rounder(x, prec) {
    prec = prec ?? prec_base;

    let suf;
    if (is_string(x) && x.endsWith('px')) {
        x = Number(x.slice(0, -2));
        suf = 'px';
    } else {
        suf = '';
    }

    let ret;
    if (is_scalar(x)) {
        ret = x.toFixed(prec);
        ret = ret.replace(/(\.[0-9]*?)0+$/, '$1').replace(/\.$/, '');
    } else {
        ret = x;
    }

    return ret + suf;
}

function props_repr(d, prec) {
    return Object.entries(d)
        .filter(([k, v]) => v != null)
        .map(([k, v]) => `${demangle(k)}="${rounder(v, prec)}"`)
        .join(' ');
}

//
// color handling
//

// Converts a #ffffff hex string into an [r,g,b] array
function hex2rgb(hex) {
    let result1 = /^#?([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})$/i.exec(hex);
    if (result1) return result1.slice(1).map(c => parseInt(c, 16));
    let result2 = /^#?([a-fA-F\d])([a-fA-F\d])([a-fA-F\d])$/i.exec(hex);
    if (result2) return result2.slice(1).map(c => parseInt(`${c}${c}`, 16));
    return null;
}

function rgb2hex(rgb) {
    let [r, g, b] = rgb.map(c => round(c).toString(16).padStart(2, '0'));
    return `#${r}${g}${b}`;
}

function rgb2hsl(color) {
    let [r, g, b] = color.map(c => c/255);
    let min = Math.min(r, g, b);
    let max = Math.max(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = (l > 0.5 ? d / (2 - max - min) : d / (max + min));
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function interpolate_vectors(c1, c2, alpha) {
    let len = min(c1.length, c2.length);
    return range(len).map(i => {
        let x = c1[i] + alpha*(c2[i]-c1[i]);
        return rounder(x, 3);
    });
}

function interpolate_hex(c1, c2, alpha) {
    let v1 = hex2rgb(c1);
    let v2 = hex2rgb(c2);
    let v = interpolate_vectors(v1, v2, alpha);
    return rgb2hex(v);
}

function interpolate_palette(c1, c2, n) {
    return linspace(0, 1, n)
        .map(alpha => interpolate_vectors(c1, c2, alpha));
}

//
// core classes
//

function degree_mod(degree, lower, upper) {
    return ((degree + lower) % (upper-lower)) - lower;
}

// public usage
function rotate_aspect(aspect, degree) {
    if (degree == null) { return aspect; }
    if (aspect == null) { return null; }
    let rotate = degree_mod(degree, -90, 90);
    let theta = (pi/180)*abs(rotate);
    return rotate_aspect_radians(aspect, theta);
}

// mostly private
function rotate_aspect_radians(aspect, theta) {
    return (aspect*cos(theta)+sin(theta))/(aspect*sin(theta)+cos(theta));
}

function align_frac(align) {
    if (is_scalar(align)) {
        return align;
    } else if (align == 'left' || align == 'top') {
        return 0;
    } else if (align == 'center' || align == 'middle') {
        return 0.5;
    } else if (align == 'right' || align == 'bottom') {
        return 1;
    } else{
        throw new Error(`Unrecognized alignment specification: ${align}`);
    }
}

function rect_remap(rect, frac) {
    let [x1, y1, x2, y2] = rect;
    let [w, h] = [x2 - x1, y2 - y1];
    let [fx1, fy1, fx2, fy2] = frac;
    return [
        x1 + fx1*w, y1 + fy1*h,
        x1 + fx2*w, y1 + fy2*h
    ];
}

class Context {
    constructor(prect, args) {
        let {coord, submap, rrect, trans, prec, debug} = args ?? {};
        this.prect = prect;
        this.rrect = rrect;
        this.coord = coord;
        this.submap = submap;
        this.trans = trans;
        this.prec = prec;
        this.debug = debug ?? false;
    }

    // map using both domain (frac) and range (rect)
    coord_to_pixel(coord) {
        let [cx, cy] = coord;
        let [cx1, cy1, cx2, cy2] = this.coord ?? coord_base;
        let [cw, ch] = [cx2 - cx1, cy2 - cy1];
        let [px1, py1, px2, py2] = this.prect;
        let [pw, ph] = [px2 - px1, py2 - py1];
        let [fx, fy] = [(cx-cx1)/cw, (cy-cy1)/ch];
        let [px, py] = [px1 + fx*pw, py1 + fy*ph];
        return [px, py];
    }

    // used for sizes such as radii or vectors
    coord_to_pixel_size(size) {
        let [sw, sh] = size;
        let [cx1, cy1, cx2, cy2] = this.coord ?? coord_base;
        let [cw, ch] = [cx2 - cx1, cy2 - cy1];
        let [px1, py1, px2, py2] = this.prect;
        let [pw, ph] = [px2 - px1, py2 - py1];
        let [px, py] = [sw*abs(pw)/abs(cw), sh*abs(ph)/abs(ch)];
        return [px, py];
    }

    // used for whole rectangles
    coord_to_pixel_rect(crect) {
        let [x1, y1, x2, y2] = crect;
        let [c1, c2] = [[x1, y1], [x2, y2]];
        let p1 = this.coord_to_pixel(c1);
        let p2 = this.coord_to_pixel(c2);
        let prect = [...p1, ...p2];
        return prect;
    }

    // NOTE: this is the main mapping function! be very careful when changing it!
    // implement placement logic: map from coordinate rect (rect) to pixel rect (prect)
    // also outputs coordinate system (coord), rotation rect (rrect), and transform string (trans)
    map(args) {
        let {rect, aspect, rotate, expand, invar, align, pivot, coord, submap} = args ?? {};
        rect = rect ?? coord_base;
        rotate = rotate ?? 0;
        expand = expand ?? false;
        invar = invar ?? true;
        align = align ?? 'center';
        pivot = pivot ?? 'center';

        // remap rotation angle
        let degrees = degree_mod(rotate, -90, 90); // map to [-90, 90]
        let theta0 = abs(degrees)*(pi/180); // in radians
        let theta = invar ? 0 : theta0; // account for rotate?

        // sort out alignment
        let [halign, valign] = ensure_vector(align, 2);
        halign = align_frac(halign);
        valign = align_frac(valign);

        // sort out pivot point
        let [hpivot, vpivot] = ensure_vector(pivot, 2);
        hpivot = align_frac(hpivot);
        vpivot = align_frac(vpivot);

        // get true pixel rect
        let [px1, py1, px2, py2] = this.coord_to_pixel_rect(rect);
        let [pw0, ph0] = [px2 - px1, py2 - py1];

        // embedded rectangle aspect
        let asp0 = pw0/ph0 ?? 1; // pixel rect (zero size is 1)
        let asgn = asp0 == 0 ? (ph0 >= 0 ? 1 : -1) : sign(asp0)
        let rasp = (aspect != null) ? asgn * aspect : asp0; // mimic outer if inner is null, but always match outer sign
        let asp1 = rotate_aspect_radians(rasp, theta);

        // shrink down if aspect mismatch
        let wide = abs(asp1) > abs(asp0);
        let [hexpand, vexpand] = ensure_vector(expand, 2);
        let [tw, th] = [cos(theta)+sin(theta)/rasp, rasp*sin(theta)+cos(theta)];
        let [rw0, rh0] = [pw0/tw, ph0/th];
        let [pw1, ph1] = ((wide & hexpand) | (!wide & !vexpand)) ? [rasp*rh0, rh0] : [rw0, rw0/rasp];
        let [rw1, rh1] = [pw1*tw, ph1*th];

        // get rotated/unrotated pixel rect
        let cx = (1-halign)*px1 + halign*px2 + (0.5-halign)*rw1;
        let cy = (1-valign)*py1 + valign*py2 + (0.5-valign)*rh1;
        let prect = [cx-0.5*pw1, cy-0.5*ph1, cx+0.5*pw1, cy+0.5*ph1];
        let rrect = invar ? prect : [cx-0.5*rw1, cy-0.5*rh1, cx+0.5*rw1, cy+0.5*rh1];

        // get transform string
        let vx = (1-hpivot)*px1 + hpivot*px2;
        let vy = (1-vpivot)*py1 + vpivot*py2;
        let [sx, sy] = [vx, vy].map(z => rounder(z, this.prec));
        let trans = (rotate != 0) ? `rotate(${rounder(rotate, this.prec)} ${rounder(sx, this.prec)} ${rounder(sy, this.prec)})` : null;

        // remap subcoords
        if (this.submap != null) coord = rect_remap(coord ?? coord_base, this.submap);

        // return new context
        return new Context(prect, {coord, submap, rrect, trans, prec: this.prec, debug: this.debug});
    }
}

// NOTE: if children gets here, it was ignored by the constructor (so dump it)
class Element {
    constructor({ tag, unary, aspect = null, children, ...attr } = {}) {
        // core display
        this.tag = tag;
        this.unary = unary;

        // layout params
        this.aspect = aspect;

        // store non-null attributes
        this.attr = filter_object(attr, v => v != null);
    }

    props(ctx) {
        return this.attr;
    }

    inner(ctx) {
        return '';
    }

    svg(ctx) {
        ctx = ctx ?? new Context(rect_base);

        // collect all properties
        const pvals = this.props(ctx);
        if (ctx.trans != null) {
            const trans = `${pvals.transform ?? ''} ${ctx.trans}`.trim();
            pvals = {...pvals, transform: trans};
        }

        // convert to strings
        const props = props_repr(pvals, ctx.prec);
        const pre = props.length > 0 ? ' ' : '';

        // optional debug info
        const debug = ctx.debug ? ` gum-class="${this.constructor.name}"` : '';

        // return final svg
        if (this.unary) {
            return `<${this.tag}${pre}${props}${debug} />`;
        } else {
            return `<${this.tag}${pre}${props}${debug}>${this.inner(ctx)}</${this.tag}>`;
        }
    }
}

function parse_bounds(bnd) {
    if (bnd == null) {
        return {rect: coord_base};
    } else if (is_array(bnd)) {
        return {rect: bnd};
    } else if (is_object(bnd)) {
        let {pos, rad, ...bnd1} = bnd;
        pos = pos ?? [0.5, 0.5];
        rad = rad ?? [0.5, 0.5];
        let rect = rad_rect(pos, rad);
        return {rect, ...bnd1};
    } else {
        throw Error(`Unrecognized bound specification: ${bnd}`);
    }
}

class Group extends Element {
    constructor({ children, aspect, coord, tag = 'g', clip = true, debug = false, ...attr } = {}) {
        // handle singleton
        if (is_element(children) || is_metaelement(children)) {
            children = [children];
        }

        // handle default positioning
        children = children
            .map(c => (is_element(c) || is_metaelement(c)) ? [c, null] : c)
            .map(([c, r]) => [c, parse_bounds(r)]);

        // get data limits
        let bounds = (children.length > 0) ?
            merge_rects(...children.map(([c, a]) => a.rect)) : null;

        // infer aspect of clipped contents
        if (aspect == null && clip) {
            const ctx = new Context(coord_base);
            const rects = children
                .filter(([c, a]) => c.aspect != null)
                .map(([c, a]) => ctx.map({aspect: c.aspect, ...a}).rrect);
            if (rects.length > 0) {
                const total = merge_rects(...rects);
                aspect = rect_aspect(total);
            }
        }

        // pass to Element
        super({ tag, unary: false, aspect, ...attr });
        this.children = children;
        this.coord = coord;
        this.bounds = bounds;
        this.debug = debug;
    }

    inner(ctx) {
        // empty group
        if (this.children.length == 0) {
            return '\n';
        }

        // map to new contexts and render
        const cargs = {coord: this.coord};
        let inside = this.children.map(([c, a]) => c.svg(
            ctx.map({aspect: c.aspect, ...cargs, ...a})
        )).filter(s => s.length > 0).join('\n');

        // debug rects
        if (this.debug || ctx.debug) {
            const dstr = this.children.map(([c, a]) => {
                const ctx1 = ctx.map({aspect: c.aspect, ...cargs, ...a});
                const ctx2 = ctx.map({...cargs, ...a});
                const rect1 = new Rect({stroke: 'red'});
                const rect2 = new Rect({stroke_dasharray: 4, stroke: 'blue'});
                return `${rect1.svg(ctx1)}\n${rect2.svg(ctx2)}`;
            }).join('\n');
            inside = `${inside}\n${dstr}`;
        }

        // return padded
        return `\n${inside}\n`;
    }
}

class SVG extends Group {
    constructor({ children, size = size_base, prec = prec_base, bare = false, filters = null, ...attr } = {}) {
        // handle filters
        if (filters != null) {
            const defs = new Defs(filters);
            children = [defs, ...children];
        }

        // pass to Group
        const svg_props = bare ? {} : svg_props_base;
        super({ tag: 'svg', children, ...svg_props, ...attr });

        if (is_scalar(size)) {
            if (this.aspect == null) {
                size = [size, size];
            } else if (this.aspect >= 1) {
                size = [size, size/this.aspect];
            } else {
                size = [size*this.aspect, size];
            }
        }

        this.size = size;
        this.prec = prec;
    }

    props(ctx) {
        const [w, h] = this.size;
        const box = `0 0 ${w} ${h}`;
        const base = {viewBox: box, xmlns: ns_svg};
        return {...base, ...this.attr};
    }

    svg(args) {
        args = args ?? {};
        const rect = [0, 0, ...this.size];
        const aspec = rect_aspect(rect);
        const ctx = new Context(rect, {aspec, prec: this.prec, ...args});
        return super.svg(ctx);
    }
}

//
// layout classes
//

function check_singleton(children) {
    const is_array = Array.isArray(children);
    if (children == null || (is_array && children.length != 1)) {
        throw Error('Must have exactly one child');
    }
    return is_array ? children[0] : children;
}

// TODO: auto-adjust padding/margin for aspect
//       it seems adjust only does this if child aspect is not null
//       but we also want to do it if own aspect is not null
class Frame extends Group {
    constructor({ children: children0, padding = 0, margin = 0, border = 0, aspect, adjust = true, flex = false, rotate, invar, align, shrink, shape, rounded, stroke, fill, ...attr0 } = {}) {
        // validate children
        const child = check_singleton(children0);

        // handle border attributes
        const [border_attr, attr] = prefix_split(['border'], attr0);

        // ensure shape is a function
        if (shape == null) {
            if (rounded == null) {
                shape = (a => new Rect(a));
            } else {
                shape = (a => new RoundedRect({rounded, ...a}));
            }
        } else {
            shape = ensure_function(shape);
        }

        // convenience boxing
        padding = pad_rect(padding);
        margin = pad_rect(margin);

        // aspect adjusted padding/margin
        if (adjust && child != null && child.aspect != null) {
            padding = aspect_invariant(padding, 1/child.aspect);
            margin = aspect_invariant(margin, 1/child.aspect);
        }

        // get box sizes
        const casp = rotate_aspect(child.aspect, rotate);
        const iasp = aspect ?? casp;
        const [crect, brect, basp, tasp] = map_padmar(padding, margin, iasp);
        aspect = flex ? null : (aspect ?? tasp);

        // make border box
        const rargs = {stroke_width: border, stroke, fill, ...border_attr};
        const rect = shape(rargs);

        // gather children
        const children = [
            [rect, brect],
            [child, {rect: crect, rotate, invar, align, shrink}],
        ];

        // pass to Group
        super({ children, aspect, clip: false, ...attr });
    }
}

function get_orient(direc) {
    if (direc == 'v' || direc == 'vert' || direc == 'vertical') {
        return 'v';
    } else if (direc == 'h' || direc == 'horiz' || direc == 'horizontal') {
        return 'h';
    } else {
        throw new Error(`Unrecognized direction specification: ${direc}`);
    }
}

// fill in missing values to ensure: sum(vals) == target
function distribute_extra(vals, target) {
    target = target ?? 1;
    const nmiss = vals.filter(v => v == null).length;
    const total = sum(vals);
    const fill = (nmiss > 0) ? (target-total)/nmiss : 0;
    return vals.map(v => v ?? fill);
}

// expects list of Element or [Element, height]
// this is written as vertical, horizonal swaps dimensions and inverts aspects
class Stack extends Group {
    constructor({ direc, children: children0, expand = true, align = 'center', spacing = 0, aspect = 'auto', debug = false, ...attr } = {}) {
        direc = get_orient(direc);

        // short circuit if empty
        if (children0.length == 0) return super({ children: [], aspect, ...attr });

        // fill in missing heights with null
        const [elements, heights] = zip(...children0.map(c => {
            if (is_element(c)) { return [c, null]; }
            else if (is_scalar(c)) { return [new Spacer(), c]; }
            else { return c; }
        }));

        // get aspects and adjust for direction
        let aspects = elements.map(c => c.aspect);
        const hasa = any(zip(heights, aspects).map(
            ([h, a]) => a != null && h != null
        )) || all(aspects.map(a => a != null));
        if (direc == 'h') {
            aspects = aspects.map(a => (a != null) ? 1/a : null);
        }

        // expand elements to fit width?
        let aspect_ideal = null, wlims;
        if (expand && !hasa) {
            // aspectless and full width
            heights = distribute_extra(heights);
            wlims = heights.map(w => [0, 1]);
        } else if (expand && hasa) {
            // if aspect, heights are adjusted so that all elements have full width
            // if no aspect, they can be stretched to full width anyway
            heights = zip(heights, aspects).map(([h, a]) => (a != null) ? 1/a : h);

            // renormalize heights and find ideal aspect
            const has = zip(heights, aspects);
            const atot = sum(has.map(([h, a]) => (a != null) ? h : null));
            const utot = sum(has.map(([h, a]) => (a == null) ? h : null));
            heights = has.map(([h, a]) => (a != null) ? (1-utot)*(h/atot) : h);
            aspect_ideal = (1-utot)/atot;

            // width is always full with expand
            wlims = heights.map(w => [0, 1]);
        } else {
            // fill in missing heights and find aspect widths
            heights = distribute_extra(heights);
            let widths = zip(heights, aspects).map(([h, a]) => (a != null) ? h*a : null);

            // ideal aspect determined by widest element
            const wmax = max(...widths) ?? 1;
            widths = widths.map(w => (w != null) ? w/wmax : 1);
            aspect_ideal = wmax;

            // set wlims according to alignment
            const afrac = align_frac(align);
            wlims = widths.map(w => (w != null) ? [afrac*(1-w), afrac+(1-afrac)*w] : [0, 1]);
        }

        // convert heights to cumulative intervals (with spacing)
        const pos = -spacing;
        let hlims = heights.map(y => [pos += spacing, pos += y]);
        hlims = hlims.map(([h1, h2]) => [h1/pos, h2/pos]);
        aspect_ideal = (aspect_ideal != null) ? aspect_ideal/pos : null;

        // if any element has an aspect, use ideal aspect
        // otherwise, just go with null aspect unless specified
        if (aspect == 'auto') {
            aspect = aspect_ideal;
        } else if (aspect == 'none') {
            aspect = null;
        }

        // swap dims if horizontal
        if (direc == 'h') {
            [wlims, hlims] = [hlims, wlims];
            aspect = (aspect != null) ? 1/aspect : null;
        }

        // compute child boxes
        children = zip(elements, wlims, hlims)
            .map(([c, [fw0, fw1], [fh0, fh1]]) => [c, [fw0, fh0, fw1, fh1]]);

        // add in debug lines
        if (debug) {
            let rect = new Rect({stroke: 'blue', stroke_dasharray: [4, 4]});
            let boxes = zip(wlims, hlims)
                .map(([[fw0, fw1], [fh0, fh1]]) => [rect, [fw0, fh0, fw1, fh1]]);
            children = [...children, ...boxes];
        }

        // pass to Group
        super({ children, aspect, ...attr });
    }
}

class VStack extends Stack {
    constructor(attr) {
        super({ direc: 'v', ...attr });
    }
}

class HStack extends Stack {
    constructor(attr) {
        super({ direc: 'h', ...attr });
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
    constructor({ children: children0, rect, pos = [0.5, 0.5], rad = [0.5, 0.5], rotate, expand, invar, align, pivot, ...attr } = {}) {
        const child = check_singleton(children0);

        // find child position
        rect = rect ?? rad_rect(pos, rad);
        const children = [[child, {rect, rotate, expand, invar, align, pivot}]];

        // pass to Group
        super({ children, clip: false, ...attr });
    }
}

class Flip extends Group {
    constructor({ children: children0, direc, ...attr } = {}) {
        direc = get_orient(direc);
        const child = check_singleton(children0);
        const rect = direc == 'v' ? [0, 1, 1, 0] : [1, 0, 0, 1];
        const children = [[child, rect]];
        super({ children, clip: true, ...attr });
    }
}

class VFlip extends Flip {
    constructor(attr) {
        super({ direction: 'v', ...attr });
    }
}

class HFlip extends Flip {
    constructor(attr) {
        super({ direction: 'h', ...attr });
    }
}

let anchor_rect = {
    'left': [0, 0, 0, 1], 'right': [1, 0, 1, 1],
    'top': [0, 0, 1, 0], 'bottom': [0, 1, 1, 1]
};

class Anchor extends Group {
    constructor({ children: children0, side, align, ...attr } = {}) {
        const child = check_singleton(children0);

        // get anchor rect
        const rect = anchor_rect[side];
        align = align ?? 1 - align_frac(side);

        // pass to Group
        const children = [[child, {rect, align, expand: true}]];
        super({ children, clip: false, ...attr });
    }
}

class Attach extends Group {
    constructor({ children: children0, offset = 0, size = 1, align, side, ...attr } = {}) {
        const child = check_singleton(children0);

        const extent = size + offset;
        const rmap = {
            'left': [-extent, 0, -offset, 1], 'right': [1+offset, 0, 1+extent, 1],
            'top': [0, -extent, 1, -offset], 'bottom': [0, 1+offset, 1, 1+extent]
        };

        const children = [[child, {rect: rmap[side], align}]];
        super({ children, clip: false, ...attr });
    }
}

class Points extends Group {
    constructor({ points = [], size = 0.01, shape, stroke, fill, stroke_width, ...attr } = {}) {
        shape = shape ?? new Dot({stroke, fill, stroke_width});

        // handle different forms
        points = points.map(p => is_scalar(p[0]) ? [p] : p);
        points = points.map(p => is_element(p[0]) ? p : [shape, ...p]);
        points = points.map(p => (p.length >= 3) ? p : [...p, size]);

        // pass to Group
        const children = points.map(([s, p, r]) => [s, rad_rect(p, r)]);
        super({ children, clip: false, ...attr });
    }
}

class Absolute extends Element {
    constructor({ children, size, ...attr } = {}) {
        super({ tag: 'g', unary: false, ...attr });
        this.child = check_singleton(children);
        this.size = size;
        this.place = attr;
    }

    inner(ctx) {
        const { prect } = ctx;
        const { child, place } = this;
        const { aspect } = child;

        // get relative size from absolute size
        const bsize = rect_dims(prect);
        const psize = ensure_vector(this.size, 2);
        const rad = divide(div(psize, bsize), 2);

        // render child element
        const args = parse_bounds({rad, aspect, ...place});
        const ctx1 = ctx.map(args);
        return this.child.svg(ctx1);
    }
}

//
// basic geometry
//

// this can have an aspect, which is utilized by layouts
class Spacer extends Element {
    constructor(attr) {
        super({ tag: 'g', unary: true, ...attr });
    }

    svg(ctx) {
        return '';
    }
}

class Line extends Element {
    constructor({ p1, p2, ...attr } = {}) {
        super({ tag: 'line', unary: true, ...attr });
        [this.p1, this.p2] = [p1, p2];
        this.bounds = merge_points(p1, p2);
    }

    props(ctx) {
        const [x1, y1] = ctx.coord_to_pixel(this.p1);
        const [x2, y2] = ctx.coord_to_pixel(this.p2);
        return {x1, y1, x2, y2, ...this.attr};
    }
}

class UnitLine extends Line {
    constructor({ direc, pos = 0.5, lim = limit_base, ...attr } = {}) {
        direc = get_orient(direc);
        const [lo, hi] = lim;
        const [p1, p2] = (direc == 'v') ?
            [[pos, lo], [pos, hi]] :
            [[lo, pos], [hi, pos]];
        super({ p1, p2, ...attr });
    }
}

class VLine extends UnitLine {
    constructor(attr) {
        super({ direc: 'v', ...attr });
    }
}

class HLine extends UnitLine {
    constructor(attr) {
        super({ direc: 'h', ...attr });
    }
}

class Rect extends Element {
    constructor({ pos = [0.5, 0.5], rad = [0.5, 0.5], rect, rounded, ...attr } = {}) {
        rect = rect ?? rad_rect(pos, rad);
        super({ tag: 'rect', unary: true, ...attr });
        this.rect = rect;
        this.rounded = rounded;
        this.bounds = merge_rects(this.rect);
    }

    props(ctx) {
        const [x1, y1, x2, y2] = ctx.coord_to_pixel_rect(this.rect);

        // orient increasing
        let [x, y] = [x1, y1];
        let [w, h] = [x2 - x1, y2 - y1];
        if (w < 0) { x += w; w *= -1; }
        if (h < 0) { y += h; h *= -1; }

        // scale border rounded
        let rx, ry;
        if (this.rounded != null) {
            let s = 0.5*(w+h);
            if (is_scalar(this.rounded)) {
                rx = s*this.rounded;
            } else {
                [rx, ry] = multiply(this.rounded, s);
            }
        }

        // output properties
        return {x, y, width: w, height: h, rx, ry, ...this.attr};
    }
}

class Square extends Rect {
    constructor({ pos = [0.5, 0.5], rad = 0.5, ...attr } = {}) {
        const [x, y] = pos;
        const rect = [x - rad, y - rad, x + rad, y + rad];
        super({ rect, aspect: 1, ...attr });
    }
}

class Ellipse extends Element {
    constructor({ pos = [0.5, 0.5], rad = [0.5, 0.5], ...attr } = {}) {
        super({ 'tag': 'ellipse', 'unary': true, ...attr });
        this.pos = pos;
        this.rad = rad;

        let [px, py] = pos;
        let [rx, ry] = rad;
        this.bounds = [px - rx, py - ry, px + rx, py + ry];
    }

    props(ctx) {
        const [cx, cy] = ctx.coord_to_pixel(this.pos);
        const [rx, ry] = ctx.coord_to_pixel_size(this.rad);
        const base = {cx, cy, rx, ry};
        return {...base, ...this.attr};
    }
}

class Circle extends Ellipse {
    constructor({ pos = [0.5, 0.5], rad = 0.5, ...attr } = {}) {
        const rad2 = [rad, rad];
        super({ pos, rad: rad2, aspect: 1, ...attr });
    }
}

class Dot extends Circle {
    constructor({ stroke = 'black', fill = 'black', rad = 0.5, ...attr }) {
        super({ stroke, fill, rad, ...attr });
    }
}

class Ray extends Element {
    constructor({ theta = 45, aspect, ...attr } = {}) {
        // map into (-90, 90];
        if (theta < -90 || theta > 90) {
            theta = ((theta + 90) % 180) - 90;
        }
        if (theta == -90) {
            theta = 90;
        }

        // map theta into direction and aspect
        let direc;
        if (theta == 90) {
            direc = Infinity;
            aspect = 1;
        } else if (theta == 0) {
            direc = 0;
            aspect = 1;
        } else {
            const direc0 = tan(theta*(pi/180));
            direc = direc0;
            aspect = 1/abs(direc0);
        }

        // pass to Element
        super({ tag: 'line', unary: true, aspect, ...attr });
        this.direc = direc;
    }

    props(ctx) {
        let p1, p2;
        if (!isFinite(this.direc)) {
            [p1, p2] = [[0.5, 0], [0.5, 1]];
        } else if (this.direc == 0) {
            [p1, p2] = [[0, 0.5], [1, 0.5]];
        } else if (this.direc > 0) {
            [p1, p2] = [[0, 0], [1, 1]];
        } else {
            [p1, p2] = [[0, 1], [1, 0]];
        }
        const [x1, y1] = ctx.coord_to_pixel(p1);
        const [x2, y2] = ctx.coord_to_pixel(p2);
        return {x1, y1, x2, y2, ...this.attr};
    }
}

//
// path builder
//

class Pointstring extends Element {
    constructor({ tag, points, ...attr } = {}) {
        super({ tag, unary: true, ...attr });
        this.points = points;
        if (points.length > 0) {
            this.bounds = merge_points(...points);
        }
    }

    props(ctx) {
        const pixels = this.points.map(p => ctx.coord_to_pixel(p));
        const points = pixels.map(
            ([x, y]) => `${rounder(x, ctx.prec)},${rounder(y, ctx.prec)}`
        ).join(' ');
        return {points, ...this.attr};
    }
}

class Polyline extends Pointstring {
    constructor({ points, ...attr } = {}) {
        super({ tag: 'polyline', points, fill: 'none', ...attr });
    }
}

class Polygon extends Pointstring {
    constructor({ points, ...attr } = {}) {
        super({ tag: 'polygon', points, ...attr });
    }
}

class Triangle extends Polygon {
    constructor({ pos = [0.5, 0.5], rad = 0.5, ...attr } = {}) {
        // get vertices
        const [px, py] = pos;
        const [rx, ry] = ensure_vector(rad, 2);
        const points = [[px - rx, py + ry], [px + rx, py + ry], [px, py - ry]];

        // pass to Polygon
        super({ points, ...attr });
    }
}

class Path extends Element {
    constructor({ cmds, ...attr } = {}) {
        super({ tag: 'path', unary: true, ...attr });
        this.cmds = cmds;
    }

    props(ctx) {
        const d = this.cmds.map(c => c.data(ctx)).join(' ');
        return {d, ...this.attr};
    }
}

class Command {
    constructor(cmd) {
        this.cmd = cmd;
    }

    args(ctx) {
        return '';
    }

    data(ctx) {
        return `${this.cmd} ${this.args(ctx)}`;
    }
}

class MoveCmd extends Command {
    constructor(pos) {
        super('M');
        this.pos = pos;
    }

    args(ctx) {
        const [x, y] = ctx.coord_to_pixel(this.pos);
        return `${rounder(x, ctx.prec)} ${rounder(y, ctx.prec)}`;
    }
}

class LineCmd extends Command {
    constructor(pos) {
        super('L');
        this.pos = pos;
    }

    args(ctx) {
        const [x, y] = ctx.coord_to_pixel(this.pos);
        return `${rounder(x, ctx.prec)} ${rounder(y, ctx.prec)}`;
    }
}

class ArcCmd extends Command {
    constructor(pos, rad, large, sweep) {
        super('A');
        this.pos = pos;
        this.rad = rad;
        this.large = large;
        this.sweep = sweep;
    }

    args(ctx) {
        const [x1, y1] = ctx.coord_to_pixel(this.pos);
        const [rx, ry] = ctx.coord_to_pixel_size(this.rad);
        return `${rounder(rx, ctx.prec)} ${rounder(ry, ctx.prec)} 0 ${this.large} ${this.sweep} ${rounder(x1, ctx.prec)} ${rounder(y1, ctx.prec)}`;
    }
}

// this makes a rounded corner between two points
// the direction is by default counter-clockwise
// this assumes the cursor is at pos0
class CornerCmd {
    constructor(pos0, pos1) {
        this.pos0 = pos0;
        this.pos1 = pos1;
    }

    data(ctx) {
        const [x0, y0] = ctx.coord_to_pixel(this.pos0);
        const [x1, y1] = ctx.coord_to_pixel(this.pos1);

        // compute aspect ratio
        const [dx, dy] = [Math.abs(x1 - x0), Math.abs(y1 - y0)];
        const aspect = dx / dy;

        // are we in quadrants 1/3 or 2/4?
        const [top, right] = [x1 < x0, y1 < y0];
        const [diag, wide] = [top == right, aspect > 1];

        // get corner point and fitted radius
        const [cx, cy] = diag ? [x0, y1] : [x1, y0];
        const rad = Math.min(dx, dy);

        // get the intra-radial points
        const sigx = right ? -1 : 1; const sigy = top ? 1 : -1;
        const [x0p, y0p] = diag ? [cx, cy + sigy*rad] : [cx + sigx*rad, cy];
        const [x1p, y1p] = diag ? [cx + sigx*rad, cy] : [cx, cy + sigy*rad];

        // full command
        return (
            ((diag != wide) ? `L ${rounder(x0p, ctx.prec)} ${rounder(y0p, ctx.prec)} ` : '')
            + `A ${rounder(rad, ctx.prec)} ${rounder(rad, ctx.prec)} 0 0 0 ${rounder(x1p, ctx.prec)} ${rounder(y1p, ctx.prec)} `
            + ((diag == wide) ? `L ${rounder(x1, ctx.prec)} ${rounder(y1, ctx.prec)} ` : '')
        );
    }
}

function norm_angle(deg) {
    if (deg == 360) return 359.99;
    deg = deg % 360;
    return deg < 0 ? deg + 360 : deg;
}

class Arc extends Path {
    constructor({ deg0, deg1, pos = [0.5, 0.5], rad = [0.5, 0.5], ...attr } = {}) {
        deg0 = norm_angle(deg0);
        deg1 = norm_angle(deg1);

        // get radian angles
        const th0 = d2r * deg0;
        const th1 = d2r * deg1;

        // get start/stop points
        const [x0, y0] = pos; const [rx, ry] = rad;
        const pos0 = [x0 + rx * cos(th0), y0 - ry * sin(th0)];
        const pos1 = [x0 + rx * cos(th1), y0 - ry * sin(th1)];

        // get large/sweep flags
        const delta = norm_angle(deg1 - deg0);
        const large = delta > 180 ? 1 : 0;
        const sweep = delta < 0 ? 1 : 0;

        // send commands to path
        const cmds = [
            new MoveCmd(pos0),
            new ArcCmd(pos1, rad, large, sweep),
        ];
        super({ cmds, ...attr });
    }
}

function parse_rounded(rounded) {
    if (is_scalar(rounded)) {
        rounded = [rounded, rounded, rounded, rounded];
    } else if (is_array(rounded) && rounded.length == 2) {
        const [rx, ry] = rounded;
        rounded = [[rx, ry], [rx, ry], [rx, ry], [rx, ry]];
    }
    return rounded.map(r => ensure_vector(r, 2));
}

// supports different rounded for each corner
class RoundedRect extends Path {
    constructor({ rounded = 0, border = 1, ...attr } = {}) {

        // convert to array of arrays
        const [rtl, rtr, rbr, rbl] = parse_rounded(rounded);
        const [rtlx, rtly] = rtl; const [rtrx, rtry] = rtr;
        const [rbrx, rbry] = rbr; const [rblx, rbly] = rbl;

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
        ];

        // pass to Path
        super({ cmds, stroke_width: border, ...attr });
    }
}

//
// filters and effects
//

// random 6-digit hex
function random_hex() {
    return Math.floor(Math.random()*0x1000000).toString(16);
}

class MetaElement {
    constructor({ tag, ...attr } = {}) {
        this.tag = tag;
        this.attr = attr;
    }

    inside(ctx) {
        return null;
    }

    svg(ctx) {
        const inside = this.inside();
        const props = Object.entries(this.attr).map(([k, v]) =>
            `${k.replace('_', '-')}="${v}"`
        ).join(' ');
        if (inside == null) {
            return `<${this.tag} ${props} />`;
        } else {
            return `<${this.tag} ${props}>\n${inside}\n</${this.tag}>`;
        }
    }
}

class MetaGroup extends MetaElement {
    constructor({ tag, children, ...attr } = {}) {
        super({ tag, ...attr });
        this.children = children;
    }

    inside(ctx) {
        return this.children.map(c => c.svg(ctx)).join('\n');
    }
}

class Defs extends MetaGroup {
    constructor({ children, ...attr } = {}) {
        super({ tag: 'defs', children, ...attr });
    }
}

class Style extends MetaElement {
    constructor({ text, ...attr } = {}) {
        super({ tag: 'style', type: 'text/css', ...attr });
        this.text = text;
    }

    inside(ctx) {
        return this.text;
    }
}

class Effect extends MetaElement {
    constructor({ name, ...attr } = {}) {
        super({ tag: `fe${name}`, ...attr });
        const klass = this.constructor.name.toLowerCase();
        this.result = attr.result ?? `${klass}_${random_hex()}`;
    }
}

class Filter extends MetaGroup {
    constructor({ name, effects, ...attr } = {}) {
        super({ tag: 'filter', effects, id: name, ...attr });
    }
}

class DropShadow extends Effect {
    constructor({ dx = 0, dy = 0, blur = 0, color = 'black', ...attr } = {}) {
        super({ dx, dy, stdDeviation: blur, flood_color: color, ...attr });
    }
}

class GaussianBlur extends Effect {
    constructor({ blur = 0, ...attr } = {}) {
        super({ tag: 'GaussianBlur', stdDeviation: blur, ...attr });
    }
}

class MergeNode extends MetaElement {
    constructor({ input, ...attr } = {}) {
        super({ tag: 'feMergeNode', in: input, ...attr });
    }
}

class Merge extends MetaGroup {
    constructor({ effects, ...attr } = {}) {
        const nodes = effects.map(e => new MergeNode({ input: e.result }));
        super({ tag: 'feMerge', nodes, ...attr });
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
        .replace(/'/g, '&apos;');
}

function check_string(children) {
    const child = check_singleton(children);
    if (typeof child !== 'string') {
        throw Error('Must be a string');
    }
    return child;
}

class Text extends Element {
    constructor({ children: children0, font_family, font_weight, font_size, color = 'black', offset = [0, -0.13], ...attr } = {}) {
        const text = check_string(children0);
        const [calc_args, attr] = prefix_split(['calc'], attr);

        // compute text box
        const fargs = {family: font_family, weight: font_weight, size: font_size, ...calc_args};
        const [xoff0, yoff0, width0, height0] = text_sizer(text, fargs);

        // get position and size
        const offset1 = add([xoff0/height0, yoff0/height0], offset);
        const size = [width0, height0];
        const aspect = width0/height0;

        // pass to element
        super({ tag: 'text', unary: false, aspect, font_family, font_weight, font_size, stroke: color, fill: color, ...attr });
        this.text = escape_xml(text);
        this.offset = offset1;
        this.size = size;
    }

    // because text will always be displayed upright,
    // we need to find the ordered bounds of the text
    // and then offset it by the given offset
    props(ctx) {
        // get ordered bounds
        const [xa, ya] = ctx.coord_to_pixel([0, 0]);
        const [xb, yb] = ctx.coord_to_pixel([1, 1]);
        const [x0, y0] = [Math.min(xa, xb), Math.min(ya, yb)];
        const [w0, h0] = [Math.abs(xb - xa), Math.abs(yb - ya)];

        // get display position
        const [xoff, yoff] = ctx.coord_to_pixel_size(this.offset);
        const [x, y] = [x0 + xoff, y0 + yoff + h0];

        // get font size
        const { font_size } = this.attr;
        const h = font_size ?? h0;

        // handle horizontal centering
        if (font_size != null) {
            const frac = font_size / h0;
            x += w0 * (1 - frac) / 2;
        }

        // get adjusted size
        return { x, y, font_size: `${h}px`, ...this.attr };
    }

    inner(ctx) {
        return this.text;
    }
}

class TextSize extends Absolute {
    constructor({ children: children0, size, ...attr } = {}) {
        const children = new Text({ children: children0, ...attr });
        super({ children, size, expand: [true, false], ...attr });
    }
}

class MultiText extends VStack {
    constructor({ children: children0, spacing, align, ...attr }) {
        const children = children0.map(t => new Text({ t, ...attr}));
        super({ children, spacing, align });
    }
}

class Emoji extends Text {
    constructor({ tag, ...attr } = {}) {
        let text = emoji_table[tag];
        let text_attr = {};
        if (text == null) {
            text = `:${tag}:`;
            text_attr.fill = red;
            text_attr.stroke = red;
        }
        super({ children: text, ...text_attr, ...attr });
    }
}

function get_attributes(elem) {
    return Object.fromEntries(
        Array.from(elem.attributes, ({name, value}) => [name, value])
    )
}

class Latex extends Element {
    constructor({ children, offset = [0, 0], scale = 1, ...attr } = {}) {
        const text = check_string(children);

        // render with mathjax (or do nothing if mathjax is not available)
        let svg_attr, math, width, height, aspect;
        if (typeof MathJax !== 'undefined') {
            // render with mathjax
            let output = MathJax.tex2svg(text);
            let svg = output.children[0];

            // strip outer size attributes
            svg.removeAttribute('width');
            svg.removeAttribute('height');

            // get width and height
            let viewBox = svg.getAttribute('viewBox');
            let viewNum = viewBox.split(' ').map(Number);
            [width, height] = viewNum.slice(2);
            aspect = width/height;

            // get tag info and inner svg
            svg_attr = get_attributes(svg);
            math = svg.innerHTML;
        } else {
            math = text;
        }

        // pass to element
        super({ tag: 'svg', unary: false, aspect, ...svg_attr, ...attr });
        this.math = math;
        this.offset = offset;
        this.scale = scale;
    }

    props(ctx) {
        // get ordered bounds
        const [xa, ya] = ctx.coord_to_pixel([0, 0]);
        const [xb, yb] = ctx.coord_to_pixel([1, 1]);
        const [x0, y0] = [Math.min(xa, xb), Math.min(ya, yb)];

        // get display position
        const [xoff, yoff] = ctx.coord_to_pixel_size(this.offset);
        const [w0, h0] = ctx.coord_to_pixel_size([1, 1]);
        const [w, h] = [w0 * this.scale, h0 * this.scale];
        const [x, y] = [x0 + xoff, y0 + yoff];

        // get adjusted size
        return { x, y, width: w, height: h, font_size: `${h}px`, ...this.attr };
    }

    inner(ctx) {
        return `\n${this.math}\n`;
    }
}

class TextFrame extends Frame {
    constructor({ children: children0, padding = 0.1, border = 1, spacing = 0.02, align, latex = false, emoji = false, ...attr } = {}) {
        const [text_attr, attr] = prefix_split(['text'], attr);

        // generate core elements
        const TextElement = latex ? Latex : emoji ? Emoji : Text;
        const maker = s => is_string(s) || is_number(s) ?
            new TextElement({ children: s, ...text_attr }) : s;
        const children = children0.length > 1 ?
            new VStack({ children: children0.map(maker), expand: false, align, spacing }) :
            maker(children0[0] ?? '');

        // pass to Group
        super({ children, padding, border, align, ...attr });
    }
}

class TitleFrame extends Frame {
    constructor({ children: children0, title, title_size = 0.075, title_fill = 'white', title_offset = 0, title_rounded = 0.1, title_border = 1, adjust = false, padding = 0, margin = 0, border = 1, aspect, ...attr0 } = {}) {
        const child = check_singleton(children0);
        const [title_attr0, frame_attr0] = prefix_split(['title'], attr0);

        // adjust padding for title
        if (adjust) {
            margin = pad_rect(margin);
            padding = pad_rect(padding);
            const [pl, pt, pr, pb] = padding;
            const [ml, mt, mr, mb] = margin;
            padding = [pl, pt + title_size, pr, pb];
            margin = [ml, mt + title_size, mr, mb];
        }

        // fill in default attributes
        const frame_attr = {margin, border, ...frame_attr0};
        const title_attr = {fill: title_fill, border: title_border, rounded: title_rounded, ...title_attr0};

        // make title box
        const base = title_offset * title_size;
        const text = new TextFrame({ children: title, ...title_attr });
        const place = new Place({ children: text, pos: [0.5, base], rad: [null, title_size], expand: true });

        // make outer frame
        const frame = new Frame({ children: child, padding });
        const group = new Group({ children: [frame, place], clip: false, aspect: aspect ?? frame.aspect });

        // apply margin only frame
        super({ children: group, ...frame_attr });
    }
}

//
// parametric paths
//

 function func_or_scalar(x) {
    if (is_scalar(x)) {
        return () => x;
    } else {
        return x;
    }
}

// determines actual values given combinations of limits, values, and functions
function sympath({fx, fy, xlim, ylim, tlim = limit_base, xvals, yvals, tvals, clip = true, N} = {}) {
    fx = func_or_scalar(fx);
    fy = func_or_scalar(fy);

    // determine data size
    const Ns = new Set([tvals, xvals, yvals].filter(v => v != null).map(v => v.length));
    if (Ns.size > 1) {
        throw new Error(`Error: data sizes must be in aggreement but got ${Ns}`);
    } else if (Ns.size == 1) {
        [N,] = Ns;
    } else {
        N = N ?? N_base;
    }

    // compute data values
    tvals = tvals ?? linspace(...tlim, N);
    if (fx != null && fy != null) {
        xvals = tvals.map(fx);
        yvals = tvals.map(fy);
    } else if (fy != null) {
        xvals = xvals ?? linspace(...xlim, N);
        yvals = xvals.map(fy);
    } else if (fx != null) {
        yvals = yvals ?? linspace(...ylim, N);
        xvals = yvals.map(fx);
    }

    // clip values
    if (clip) {
        if (xlim != null) {
            const [xmin, xmax] = xlim;
            xvals = xvals.map(x =>
                (xmin <= x && x <= xmax) ? x : null
            );
        }
        if (ylim != null) {
            const [ymin, ymax] = ylim;
            yvals = yvals.map(y =>
                (ymin <= y && y <= ymax) ? y : null
            );
        }
    }

    return [tvals, xvals, yvals];
}

class SymPath extends Polyline {
    constructor({ fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, clip, N, ...attr } = {}) {
        // compute path values
        [tvals, xvals, yvals] = sympath({
            fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, clip, N
        });

        // get valid point pairs
        const points = zip(xvals, yvals).filter(
            ([x, y]) => (x != null) && (y != null)
        );

        // pass to element
        super({ points, ...attr });
    }
}

class SymFill extends Polygon {
    constructor({ fx1, fy1, fx2, fy2, xlim, ylim, tlim, xvals, yvals, tvals, N, ...attr } = {}) {

        // compute point values
        const [tvals1, xvals1, yvals1] = sympath({
            fx: fx1, fy: fy1, xlim, ylim, tlim, xvals, yvals, tvals, N
        });
        const [tvals2, xvals2, yvals2] = sympath({
            fx: fx2, fy: fy2, xlim, ylim, tlim, xvals, yvals, tvals, N
        });

        // get valid point pairs
        const points = [...zip(xvals1, yvals1), ...zip(xvals2, yvals2).reverse()].filter(
            ([x, y]) => (x != null) && (y != null)
        );

        // pass to element
        super({ points, ...attr });
    }
}

class SymPoly extends Polygon {
    constructor({ fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, N, ...attr } = {}) {

        // compute point values
        const [tvals1, xvals1, yvals1] = sympath({
            fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, N
        });

        // get valid point pairs
        const points = zip(xvals1, yvals1);

        // pass to element
        super({ points, ...attr });
    }
}

class SymPoints extends Group {
    constructor({ fx, fy, fs, fr, size = 0.01, shape, xlim, ylim, tlim, xvals, yvals, tvals, N, ...attr } = {}) {
        shape = shape ?? new Dot();
        fr = fr ?? (() => size);
        fs = fs ?? (() => shape);

        // compute point values
        const [tvals, xvals, yvals] = sympath({
            fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, N
        });

        // make points
        const points = zip(tvals, xvals, yvals);
        const children = enumerate(points).map(([i, [t, x, y]]) =>
            [fs(x, y, t, i), rad_rect([x, y], fr(x, y, t, i))]
        );

        // pass  to element
        super({ children, clip: false, ...attr });
    }
}

function datapoints({ xvals, yvals, xlim, ylim, N } = {}) {
    if (xvals == null) {
        N = N ?? yvals.length;
        xlim = xlim ?? [0, N-1];
        xvals = linspace(...xlim, N);
    }
    if (yvals == null) {
        N = N ?? xvals.length;
        ylim = ylim ?? [0, N-1];
        yvals = linspace(...ylim, N);
    }
    return zip(xvals, yvals);
}

class DataPath extends Polyline {
    constructor({ xvals, yvals, xlim, ylim, ...attr } = {}) {
        const points = datapoints({ xvals, yvals, xlim, ylim });
        super({ points, ...attr });
    }
}

class DataPoints extends Points {
    constructor({ xvals, yvals, xlim, ylim, ...attr } = {}) {
        const points = datapoints({ xvals, yvals, xlim, ylim });
        super({ points, ...attr });
    }
}

class DataFill extends Polygon {
    constructor({ xvals1, yvals1, xvals2, yvals2, xlim, ylim, ...attr } = {}) {

        // repeat constants
        const N = max(...[xvals1, yvals1, xvals2, yvals2].map(v => v?.length));
        const [xvals1, yvals1, xvals2, yvals2] = [xvals1, yvals1, xvals2, yvals2].map(
            v => (v != null) ? ensure_vector(v, N) : null
        );

        // make forward-backard shape
        const points1 = datapoints({xvals: xvals1, yvals: yvals1, xlim, ylim, N});
        const points2 = datapoints({xvals: xvals2, yvals: yvals2, xlim, ylim, N});
        const points = [...points1, ...points2.reverse()];

        // pass to pointstring
        super({ points, ...attr });
    }
}

//
// fields
//

class Arrowhead extends Polyline {
    constructor({ direc, size = 0.5, angle = 90, base = false, ...attr } = {}) {
        // get size and angle offsets
        const [sx, sy] = ensure_vector(size, 2);
        const [dx1, dy1] = [cos(d2r*(-direc-angle/2)), sin(d2r*(-direc-angle/2))];
        const [dx2, dy2] = [cos(d2r*(-direc+angle/2)), sin(d2r*(-direc+angle/2))];

        // generate arrowhead polygon
        const points = [
            [0.5 - sx * dx1, 0.5 - sy * dy1],
            [0.5, 0.5],
            [0.5 - sx * dx2, 0.5 - sy * dy2]
        ];

        // make base if requested
        if (base) {
            points.push(points[0]);
        }

        // pass to group for rotate
        super({ points, ...attr });
    }
}

class Arrow extends Group {
    constructor({ direc, pos = [0.5, 0.5], head = 0.3, tail = 2.0, shape = 'arrow', graph = true, ...attr0 } = {}) {
        const [head_attr, tail_attr, attr] = prefix_split(['head', 'tail'], attr0);

        // baked in shapes
        if (shape == 'circle') {
            shape = (_, a) => new Dot(a);
        } else if (shape == 'arrow') {
            shape = (t, a) => new Arrowhead({ theta: t, ...a });
        } else {
            throw new Error(`Unrecognized arrow shape: ${shape}`);
        }

        // ensure vector direction
        let theta;
        if (is_scalar(direc)) {
            theta = direc;
            const radians = d2r*direc;
            direc = [cos(radians), sin(radians)];
        } else {
            theta = r2d*Math.atan2(direc[1], direc[0]);
            direc = normalize(direc, 2);
        }

        // sort out graph direction
        direc = graph ? mul(direc, [1, -1]) : direc;

        // create head (override with null direction)
        const arrow = shape(theta, {...head_attr})
        const head_elem = norm(direc, 2) == 0 ?
            new Dot({ pos, rad: head, ...head_attr }) :
            new Place({ children: arrow, pos, rad: head });

        // create tail
        const tail_direc = direc.map(z => -tail*z);
        const tail_pos = add(pos, tail_direc);
        const tail_elem = new Line({ p1: pos, p2: tail_pos, ...tail_attr });

        super({ children: [head_elem, tail_elem], ...attr });
    }
}

class Field extends Points {
    constructor({ points, direcs, marker, ...attr0 } = {}) {
        marker = marker ?? ((p, d, a) => new Arrow({ pos: p, direc: d, ...a }));
        const [marker_attr, attr] = prefix_split(['marker'], attr0);
        const field = zip(points, direcs).map(([p, d]) => [marker(p, d, marker_attr), p]);
        super({ points: field, ...attr });
    }
}

class SymField extends Field {
    constructor({ func, xlim = limit_base, ylim = limit_base, N = 10, ...attr } = {}) {
        const points = lingrid(xlim, ylim, N);
        const direcs = points.map(func);
        super({ points, direcs, ...attr });
    }
}

//
// networks
//

function get_center(elem) {
    const [xmin, ymin, xmax, ymax] = elem.bounds;
    const [xmid, ymid] = [0.5 * (xmin + xmax), 0.5 * (ymin + ymax)];
    return [xmid, ymid];
}

function get_direction(p1, p2) {
    const [x1, y1] = p1;
    const [x2, y2] = p2;

    const [dx, dy] = [x2 - x1, y2 - y1];
    const [ax, ay] = [abs(dx), abs(dy)];

    if (dy <= -ax) {
        return 'n';
    } else if (dy >= ax) {
        return 's';
    } else if (dx >= ay) {
        return 'e';
    } else if (dx <= -ay) {
        return 'w';
    }
}

function get_anchor(elem, direc) {
    const [xmin, ymin, xmax, ymax] = elem.bounds;
    const [xmid, ymid] = get_center(elem);

    if (direc == 'n') {
        return [xmid, ymin];
    } else if (direc == 's') {
        return [xmid, ymax];
    } else if (direc == 'e') {
        return [xmax, ymid];
    } else if (direc == 'w') {
        return [xmin, ymid];
    } else {
        throw new Error(`Unrecognized direction specification: ${direc}`);
    }
}

function norm_direc(direc) {
    if (direc == 'n' || direc == 'north') {
        return 'n';
    } else if (direc == 's' || direc == 'south') {
        return 's';
    } else if (direc == 'e' || direc == 'east') {
        return 'e';
    } else if (direc == 'w' || direc == 'west') {
        return 'w';
    } else {
        throw new Error(`Unrecognized direction specification: ${direc}`);
    }
}

function vec_direction(direc) {
    if (direc == 'w') {
        return [-1, 0];
    } else if (direc == 'e') {
        return [1, 0];
    } else if (direc == 'n') {
        return [0, -1];
    } else if (direc == 's') {
        return [0, 1];
    } else {
        throw new Error(`Unrecognized direction specification: ${direc}`);
    }
}

function cubic_spline(x0, x1, d0, d1) {
    const [a, b, c, d] = [
        x0, d0,
        3*(x1 - x0) - (2*d0 + d1),
        -2*(x1 - x0) + (d0 + d1),
    ];
    return t => a + b*t + c*t**2 + d*t**3;
}

class CubicSpline extends SymPath {
    constructor({ pos0, pos1, direc0, direc1, ...attr } = {}) {
        const [x0, y0] = pos0;
        const [x1, y1] = pos1;
        const [dx0, dy0] = direc0;
        const [dx1, dy1] = direc1;
        const fx = cubic_spline(x0, x1, dx0, dx1);
        const fy = cubic_spline(y0, y1, dy0, dy1);
        super({ fx, fy, ...attr });
    }
}

function unit_direc(direc) {
    if (is_scalar(direc)) {
        const radians = d2r*direc;
        return [cos(radians), sin(radians)];
    } else {
        return normalize(direc, 2);
    }
}

function vector_angle(vector) {
    return r2d*Math.atan2(vector[1], vector[0]);
}

class ArrowPath extends Group {
    constructor({ pos_beg, pos_end, direc_beg, direc_end, arrow, arrow_beg, arrow_end, arrow_size = 0.03, ...attr0 } = {}) {
        const [path_attr, arrow_beg_attr, arrow_end_attr, arrow_attr, attr] = prefix_split(
            ['path', 'arrow_beg', 'arrow_end', 'arrow'], attr0
        );
        arrow_beg = arrow ?? arrow_beg ?? false;
        arrow_end = arrow ?? arrow_end ?? true;

        // accumulate arguments
        arrow_beg_attr = {...arrow_attr, ...arrow_beg_attr};
        arrow_end_attr = {...arrow_attr, ...arrow_end_attr};

        // set default directions (gets normalized later)
        const direc = sub(pos_end, pos_beg);
        direc_beg = direc_beg ?? direc;
        direc_end = direc_end ?? direc;

        // get unit vectors
        const [vector_beg, vector_end] = [direc_beg, direc_end].map(unit_direc);
        const [angle_beg, angle_end] = [vector_beg, vector_end].map(vector_angle);

        // create cubic spline path
        const path = new CubicSpline({ pos0: pos_beg, pos1: pos_end, direc0: vector_beg, direc1: vector_end, ...path_attr });
        const children = [path];

        // make arrowheads
        if (arrow_beg) {
            const head_beg = new Arrowhead(180-angle_beg, arrow_beg_attr);
            children.push([head_beg, {pos: pos_beg, rad: arrow_size}]);
        }
        if (arrow_end) {
            const head_end = new Arrowhead(-angle_end, arrow_end_attr);
            children.push([head_end, {pos: pos_end, rad: arrow_size}]);
        }

        // pass to Group
        super({ children, ...attr });
    }
}

// this should provide a rect for positioning
class Node extends Place {
    constructor({ children: children0, pos, size = 0.1, ...attr0 } = {}) {
        const [text_attr, attr] = prefix_split(['text'], attr0);

        // make frame: handle text / element / list
        const text = is_element(child) ? child : new MultiText({ children: child, ...text_attr });
        const frame = new Frame({ children: text, flex: true, padding: 0.1, border: 1, ...attr });

        // get realized size
        if (is_scalar(size) && frame.aspect != null) {
            size = aspect_invariant(size, frame.aspect);
        }
        const rect = rad_rect(pos, size);

        // pass to place
        super({ children: frame, rect });
    }

    get_center() {
        return get_center(this);
    }

    get_anchor(direc) {
        return get_anchor(this, direc);
    }
}

class Edge extends ArrowPath {
    constructor({ beg, end, ...attr0 } = {}) {
        const [attr, attr0] = prefix_split(['arrow'], attr0);

        // unpack inputs
        const [node1, direc1] = is_element(beg) ? [beg, null] : beg;
        const [node2, direc2] = is_element(end) ? [end, null] : end;

        // auto-detect directions
        const [center1, center2] = [node1.get_center(), node2.get_center()];
        direc1 = norm_direc(direc1 ?? get_direction(center1, center2));
        direc2 = norm_direc(direc2 ?? get_direction(center2, center1));

        // get anchors and directions
        const anchor1 = node1.get_anchor(direc1);
        const anchor2 = node2.get_anchor(direc2);
        const grad1 = vec_direction(direc1);
        const grad2 = mul(vec_direction(direc2), -1);

        // pass to arrowpath
        super({ pos_beg: anchor1, pos_end: anchor2, direc_beg: grad1, direc_end: grad2, ...attr });
    }
}

//
// bar components
//

class MultiBar extends Stack {
    constructor({ direc, lengths, ...attr0 } = {}) {
        // get standardized direction
        direc = get_orient(direc);
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
    constructor({ bars, direc = 'v', width = 0.9, zero = 0, ...attr } = {}) {
        direc = get_orient(direc);

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

function make_ticklabel(s, prec, attr) {
    return new TextFrame({ children: rounder(s, prec), border: 0, padding: 0, ...attr });
}

function ensure_tick(t, prec = 2) {
    if (is_scalar(t)) {
        return [t, make_ticklabel(t, prec)];
    } else if (is_array(t) && t.length == 2) {
        const [p, x] = t;
        return is_element(x) ? t : [p, make_ticklabel(x, prec)];
    } else {
        throw new Error(`Error: tick must be value or [value,label] but got "${t}"`);
    }
}

class Scale extends Group {
    constructor({ direc, locs, ...attr } = {}) {
        direc = get_orient(direc);
        const tick_dir = direc == 'v' ? 'h' : 'v';
        const tick = new UnitLine({ direc: tick_dir, pos: 0.5 });
        let [lo, hi] = lim;
        const rect = t => direc == 'v' ? [lo, t-0.5, hi, t+0.5] : [t-0.5, lo, t+0.5, hi];
        const children = locs.map(t => [tick, rect(t)]);
        super({ children, ...attr });
    }
}

class VScale extends Scale {
    constructor(attr) {
        super({ direc: 'v', ...attr });
    }
}

class HScale extends Scale {
    constructor(attr) {
        super({ direc: 'h', ...attr });
    }
}

function invert_align(align) {
    return align == 'left' ? 'right' :
           align == 'right' ? 'left' :
           align == 'bottom' ? 'top' :
           align == 'top' ? 'bottom' :
           align;
}

// this is used by axis with the main coordinates defined
// label elements must have an aspect to properly size them
class Labels extends Group {
    constructor({ direc, ticks, align = 'center', prec = 2, ...attr } = {}) {
        direc = get_orient(direc);
        ticks = ticks.map(x => ensure_tick(x, prec));

        // anchor vertical ticks to unit-aspect boxes
        if (direc == 'v') {
            const talign = invert_align(align);
            ticks = ticks.map(([t, c]) =>
                [t, new Anchor({ children: c, aspect: 1, align: talign })]
            );
        }

        // place tick boxes using expanded lines
        const rect = t => direc == 'v' ?
            {pos: [0.5, t], rad: [0.5, 0], expand: true} :
            {pos: [t, 0.5], rad: [0, 0.5], expand: true};
        const children = ticks.map(([t, c]) => [c, rect(t)]);

        // pass to Group
        super({ children, clip: false, ...attr });
    }
}

class HLabels extends Labels {
    constructor(attr) {
        super({ direc: 'h', ...attr });
    }
}

class VLabels extends Labels {
    constructor(attr) {
        super({ direc: 'v', ...attr });
    }
}

function get_ticklim(lim) {
    if (lim == null || lim == 'up' || lim == 'right') {
        return [0.5, 1];
    } else if (lim == 'down' || lim == 'left') {
        return [0, 0.5];
    } else if (lim == 'both') {
        return [0, 1];
    } else if (lim == 'none') {
        return [0.5, 0.5];
    } else {
        return lim;
    }
}

// this is designed to be plotted directly
class Axis extends Group {
    constructor({ direc, ticks, pos = 0.5, lim = limit_base, tick_size = tick_size_base, tick_pos = 'both', label_size = label_size_base, label_offset = tick_label_offset_base, label_pos = 'center', prec = 2, ...attr0 } = {}) {
        const [label_attr, tick_attr, line_attr, attr] = prefix_split(['label', 'tick', 'line'], attr0);
        direc = get_orient(direc);

        // get numerical tick limits
        const tick_lim = get_ticklim(tick_pos);
        const tick_half = 0.5*tick_size;

        // sort out label position
        const label_pos0 = direc == 'v' ? 'left' : 'bottom';
        label_pos = label_pos ?? label_pos0;
        const lab_size = label_size*tick_size;
        const lab_off = label_offset*tick_size;
        const lab_outer = label_pos == 'left' || label_pos == 'bottom';
        const lab_base = lab_outer ? (-tick_half-lab_off-lab_size) : tick_half+lab_off;

        // extract tick information
        const [lo, hi] = lim;
        ticks = is_scalar(ticks) ? linspace(lo, hi, ticks) : ticks;
        ticks = ticks.map(t => ensure_tick(t, prec));
        const locs = ticks.map(([t, x]) => t);

        // accumulate children
        const cline = new UnitLine({ direc, pos: 0.5, lim, ...line_attr });
        const scale = new Scale({ direc, locs, lim: tick_lim, ...tick_attr });
        const label = new Labels({ direc, ticks, align: label_pos, ...label_attr });

        // position children (main direction has data coordinates)
        let lbox, sbox;
        if (direc == 'v') {
            sbox = [pos-tick_half, lo, pos+tick_half, hi];
            lbox = [pos+lab_base, lo, pos+lab_base+lab_size, hi];
        } else {
            sbox = [lo, pos-tick_half, hi, pos+tick_half];
            lbox = [lo, pos+lab_base, hi, pos+lab_base+lab_size];
        }

        // pass to Group
        const tcoord = direc == 'v' ? [0, hi, 1, lo] : [lo, 1, hi, 0];
        const children = [[cline, sbox], [scale, sbox], [label, lbox]];
        super({ children, coord: tcoord, ...attr });
        this.ticks = ticks;

        // set limits
        if (direc == 'v') {
            const [ylo, yhi] = lim;
            this.bounds = [pos, ylo, pos, yhi];
        } else {
            const [xlo, xhi] = lim;
            this.bounds = [xlo, pos, xhi, pos];
        }
    }
}

class HAxis extends Axis {
    constructor(attr) {
        super({ direc: 'h', ...attr });
    }
}

class VAxis extends Axis {
    constructor(attr) {
        super({ direc: 'v', ...attr });
    }
}

class XLabel extends Attach {
    constructor({ children: children0, offset = label_offset_base, size = label_size_base, align = 'bottom', ...attr } = {}) {
        const text = check_singleton(children0);
        const label = is_element(text) ? text : new Text({ children: text, ...attr });
        super({ children: label, offset, size, align, ...attr });
    }
}

class YLabel extends Attach {
    constructor({ children: children0, offset = label_offset_base, size = label_size_base, align = 'left', ...attr } = {}) {
        const text = check_singleton(children0);
        const label = is_element(text) ? text : new Text({ children: text, ...attr });
        const rotate = new Place({ children: label, angle: -90, invar: false });
        super({ children: rotate, offset, size, align, ...attr });
    }
}

class Title extends Frame {
    constructor({ children: children0, ...attr } = {}) {
        const text = check_singleton(children0);
        const label = is_element(text) ? text : new Text({ children: text, ...attr });
        super({ children: label, ...attr });
    }
}

class Mesh extends Scale {
    constructor({ direc, locs, lim = limit_base, opacity = 0.2, ...attr } = {}) {
        super({ direc, locs, lim, opacity, ...attr });
    }
}

class HMesh extends Mesh {
    constructor(attr) {
        super({ direc: 'h', ...attr });
    }
}

class VMesh extends Mesh {
    constructor(attr) {
        super({ direc: 'v', ...attr });
    }
}

function make_legendbadge(c, attr) {
    if (is_string(c)) {
        attr = {stroke: c, ...attr};
    } else if (is_object(c)) {
        attr = {...c, ...attr};
    } else {
        throw new Error(`Unrecognized legend badge specification: ${c}`);
    }
    return new HLine({ pos: 0.5, aspect: 1, ...attr });
}

function make_legendlabel(s) {
    return new Text({children: s});
}

class Legend extends Place {
    constructor({ lines, badgewidth = 0.1, vspacing = 0.1, hspacing = 0.025, rect, pos, rad, ...attr } = {}) {
        const [badge_attr, attr] = prefix_split(['badge'], attr);

        // construct legend badges and labels
        const [badges, labels] = zip(...lines);
        badges = badges.map(b => is_element(b) ? b : make_legendbadge(b, badge_attr));
        labels = labels.map(t => is_element(t) ? t : make_legendlabel(t));

        // construct legend grid
        const bs = new VStack({ children: badges, spacing: vspacing });
        const ls = new VStack({ children: labels, expand: false, align: 'left', spacing: vspacing });
        const vs = new HStack({ children: [bs, ls], spacing: hspacing });
        const fr = new Frame({ children: vs, ...attr });

        // pass to Place
        super({ children: fr, rect, pos, rad });
    }
}

class Note extends Place {
    constructor({ children: children0, latex = false, ...attr } = {}) {
        const [text_attr, attr] = prefix_split(['text'], attr);
        const Maker = latex ? Latex : Text;
        const label = new Maker({ children: text, ...text_attr });
        super({ children: label, ...attr });
    }
}

function expand_limits(lim, fact) {
    const [lo, hi] = lim;
    const ex = fact*(hi-lo);
    return [lo-ex, hi+ex];
}

// find minimal containing limits
function outer_limits(elems, padding=0) {
    const [xpad, ypad] = ensure_vector(padding, 2);
    const [xmin, ymin, xmax, ymax] = merge_rects(
        ...elems.map(c => c.bounds).filter(z => z != null)
    );
    [xmin, xmax] = expand_limits([xmin, xmax], xpad);
    [ymin, ymax] = expand_limits([ymin, ymax], ypad);
    return [xmin, ymin, xmax, ymax];
}

class Graph extends Group {
    constructor({ children: children0, coord, aspect, padding = 0, flex = false, flip = true, ...attr } = {}) {
        // handle singleton line
        const elems = is_element(children0) ? [children0] : children0;

        // determine coordinate limits and aspect
        let [xmin, ymin, xmax, ymax] = coord ?? outer_limits(elems, padding);
        if (flip) [ymin, ymax] = [ymax, ymin];
        coord = [xmin, ymin, xmax, ymax];
        if (!flex && aspect == null) aspect = rect_aspect(coord);

        // though the coords are inverted, we dont want the children to be flipped visually
        const children = elems.map(e => [e, {submap: [0, 1, 1, 0]}]);

        // pass to Group
        super({ children, aspect, coord, ...attr });
    }
}

class Plot extends Group {
    constructor({
        children: children0, xlim, ylim, xaxis = true, yaxis = true, xticks = num_ticks_base, yticks = num_ticks_base, grid, xgrid, ygrid, xlabel, ylabel, title, tick_size = tick_size_base, label_size, label_offset, label_align, title_size = title_size_base, title_offset = title_offset_base, xlabel_size, ylabel_size, xlabel_offset, ylabel_offset, xlabel_align, ylabel_align, padding, prec, aspect, flex = false, fill, ...attr0
    } = {}) {
        aspect = flex ? null : (aspect ?? 'auto');

        // some advanced piping
        let [
            xaxis_attr, yaxis_attr, axis_attr, xgrid_attr, ygrid_attr, grid_attr, xlabel_attr,
            ylabel_attr, label_attr, title_attr, attr
        ] = prefix_split([
            'xaxis', 'yaxis', 'axis', 'xgrid', 'ygrid', 'grid', 'xlabel', 'ylabel', 'label', 'title'
        ], attr0);
        [xaxis_attr, yaxis_attr] = [{...axis_attr, ...xaxis_attr}, {...axis_attr, ...yaxis_attr}];
        [xgrid_attr, ygrid_attr] = [{...grid_attr, ...xgrid_attr}, {...grid_attr, ...ygrid_attr}];
        [xlabel_attr, ylabel_attr] = [{...label_attr, ...xlabel_attr}, {...label_attr, ...ylabel_attr}];

        // handle singleton line
        const elems = is_element(children0) ? [children0] : children0;

        // determine coordinate limits
        const bounds = outer_limits(elems, padding);
        const [xmin, ymin, xmax, ymax] = bounds;
        xlim = xlim ?? [xmin, xmax]; [xmin, xmax] = xlim;
        ylim = ylim ?? [ymin, ymax]; [ymin, ymax] = ylim;
        const coord = [xmin, ymin, xmax, ymax];

        // ensure consistent apparent tick size
        const [xrange, yrange] = [xmax - xmin, ymax - ymin];
        aspect = (aspect == 'auto') ? abs(xrange/yrange) : aspect;
        const [xtick_size, ytick_size] = aspect_invariant(tick_size, aspect);
        [xtick_size, ytick_size] = [yrange * xtick_size, xrange * ytick_size];

        // default xaxis generation
        if (xaxis === true) {
            xaxis = new HAxis({ ticks: xticks, pos: ymin, lim: xlim, tick_size: xtick_size, ...xaxis_attr });
        } else if (xaxis === false) {
            xaxis = null;
        }

        // default yaxis generation
        if (yaxis === true) {
            yaxis = new VAxis({ ticks: yticks, pos: xmin, lim: ylim, tick_size: ytick_size, ...yaxis_attr });
        } else if (yaxis === false) {
            yaxis = null;
        }

        // fill background
        if (fill != null) {
            fill = new Rect({rect: coord, fill});
        }

        // automatic grid path
        if (grid === true || xgrid === true) {
            const xgridvals = (xaxis != null) ? xaxis.ticks.map(([x, t]) => x) : null;
            xgrid = new HMesh({ locs: xgridvals, lim: ylim, ...xgrid_attr });
        } else {
            xgrid = null;
        }
        if (grid === true || ygrid === true) {
            const ygridvals = (yaxis != null) ? yaxis.ticks.map(([y, t]) => y) : null;
            ygrid = new VMesh({ locs: ygridvals, lim: xlim, ...ygrid_attr });
        } else {
            ygrid = null;
        }

        // create graph from core elements
        const elems1 = [fill, xgrid, ygrid, ...elems, xaxis, yaxis].filter(z => z != null);
        const graph = new Graph({ children: elems1, coord, aspect, flex });

        // create base layout
        const children = [graph];

        // sort out label size and offset
        if (xlabel != null || ylabel != null) {
            label_size = label_size ?? label_size_base;
            const [xlabelsize, ylabelsize] = aspect_invariant(label_size, aspect);
            xlabel_size = xlabel_size ?? xlabelsize;
            ylabel_size = ylabel_size ?? ylabelsize;

            label_offset = label_offset ?? label_offset_base;
            const [xlabeloffset, ylabeloffset] = aspect_invariant(label_offset, aspect);
            xlabel_offset = xlabel_offset ?? xlabeloffset;
            ylabel_offset = ylabel_offset ?? ylabeloffset;

            label_align = label_align ?? 'center';
            xlabel_align = xlabel_align ?? label_align;
            ylabel_align = ylabel_align ?? label_align;
        }

        // optional axis labels
        if (xlabel != null) {
            xlabel = new XLabel({ children: xlabel, size: xlabel_size, offset: xlabel_offset, align: xlabel_align, ...xlabel_attr });
            children.push(xlabel);
        }
        if (ylabel != null) {
            ylabel = new YLabel({ children: ylabel, size: ylabel_size, offset: ylabel_offset, align: ylabel_align, ...ylabel_attr });
            children.push(ylabel);
        }

        // optional plot title
        if (title != null) {
            title = new Title({ children: title, ...title_attr });
            children.push([title, [0, -title_offset-title_size, 1, -title_offset]]);
        }

        // pass to Group
        super({ children, aspect, clip: false, ...attr });
    }
}

//
// Images
//

class Image extends Element {
    constructor(href, args) {
        let attr = args ?? {};
        let attr1 = {href, ...attr};
        super('image', true, attr1);
    }

    props(ctx) {
        let [x, y, x1, y1] = ctx.coord_to_pixel_rect(coord_base);
        let [w, h] = [x1 - x, y1 - y];
        return { x, y, width: w, height: h, ...this.attr };
    }
}

//
// scripting
//

let Gum = [
    Context, Element, Group, Group, SVG, Defs, Style, Frame, Stack, VStack, HStack, Grid, Place, Flip, VFlip, HFlip, Anchor, Attach, Points, Absolute, Spacer, Ray, Line, UnitLine, HLine, VLine, Rect, RoundedRect, Square, Ellipse, Circle, Dot, Polyline, Polygon, Path, Command, MoveCmd, LineCmd, ArcCmd, CornerCmd, Arc, Triangle, Text, TextSize, MultiText, Emoji, Latex, TextFrame, TitleFrame, Arrow, Field, SymField, Arrowhead, ArrowPath, Node, Edge, SymPath, SymFill, SymPoly, SymPoints, DataPath, DataPoints, DataFill, VMultiBar, HMultiBar, Bars, Scale, VScale, HScale, Labels, VLabels, HLabels, Axis, HAxis, VAxis, XLabel, YLabel, Mesh, Graph, Plot, BarPlot, Legend, Note, range, linspace, enumerate, repeat, meshgrid, lingrid, hex2rgb, rgb2hex, rgb2hsl, interpolate_vectors, interpolate_hex, interpolate_palette, gzip, zip, reshape, split, concat, pos_rect, pad_rect, rad_rect, sum, prod, exp, log, sin, cos, min, max, abs, pow, sqrt, floor, ceil, round, atan, norm, add, sub, mul, clamp, mask, rescale, sigmoid, logit, smoothstep, pi, phi, r2d, d2r, rounder, make_ticklabel, aspect_invariant, random, uniform, normal, cumsum, blue, red, green, Filter, Effect, DropShadow, Image
];

// detect object types
function detect(g) {
    if ('prototype' in g) {
        let [t, ...x] = g.toString().split(' ');
        return t;
    } else {
        return 'value';
    }
}

// main parser entry
let gums0 = Gum.map(g => g.name);
function parseGum(src, extra) {
    extra = extra ?? [];
    let gums1 = extra.map(g => g.name);
    let gums = [...gums0, ...gums1];
    let mako = [...Gum, ...extra];
    let expr = new Function(gums, src);
    return expr(...mako);
}

function renderElem(elem, args) {
    if (is_element(elem)) {
        elem = (elem instanceof SVG) ? elem : new SVG({ children: [elem], ...args });
        return elem.svg();
    } else {
        return String(elem);
    }
}

function renderGum(src, args) {
    let elem = parseGum(src);
    return renderElem(elem, args);
}

function renderGumSafe(src, args) {
    // parse gum into element
    let elem;
    try {
        elem = parseGum(src);
    } catch (err) {
        throw new Error(`parse error, line ${err.lineNumber}: ${err.message}\n${err.stack}`);
    }

    // check for null
    if (elem == null) {
        throw new Error('no data. does your code return an element?');
    }

    // render element to svg
    let svg;
    try {
        svg = renderElem(elem, args);
    } catch (err) {
        throw new Error(`render error, line ${err.lineNumber}: ${err.message}\n${err.stack}`);
    }

    // success
    return svg;
}

function parseHTML(str) {
    let tmp = document.implementation.createHTMLDocument('');
    tmp.body.innerHTML = str;
    return tmp.body.children[0];
}

// image injection for static viewing
function injectImage(img) {
    let src = img.getAttribute('src');
    let request = new XMLHttpRequest();
    request.open('GET', src, true);
    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            let cls = img.classList;
            let alt = img.getAttribute('alt');
            let svg = parseHTML(this.response);
            svg.classList = cls;
            svg.setAttribute('alt', alt);
            img.parentNode.replaceChild(svg, img);
        }
    }
    request.send();
}

function injectScript(scr) {
    let src = scr.innerText;
    let width = scr.getAttribute('width');
    let size = string_to_int(scr.getAttribute('size'));
    let svg = renderGum(src, {size: size});
    let elem = parseHTML(svg);
    if (width != null) {
        elem.style.width = width;
        elem.style.display = 'block';
        elem.style.margin = 'auto';
    }
    scr.replaceWith(elem);
}

function injectScripts(elem) {
    elem = elem ?? document;
    elem.querySelectorAll('script').forEach(scr => {
        if (scr.getAttribute('type') == 'text/gum') {
            injectScript(scr);
        }
    })
}

function injectImages(elem) {
    elem = elem ?? document;
    elem.querySelectorAll('img').forEach(img => {
        if (img.classList.contains('gum')) {
            injectImage(img);
        }
    });
}

//
// exports
//

export {
    Gum, Context, Element, Group, SVG, Defs, Style, Frame, Stack, VStack, HStack, Grid, Place, Flip, VFlip, HFlip, Anchor, Attach, Points, Absolute, Spacer, Ray, Line, UnitLine, HLine, VLine, Rect, RoundedRect, Square, Ellipse, Circle, Dot, Polyline, Polygon, Path, Command, MoveCmd, LineCmd, ArcCmd, CornerCmd, Arc, Triangle, Text, TextSize, MultiText, Emoji, Latex, TextFrame, TitleFrame, Arrow, Field, SymField, Arrowhead, ArrowPath, Node, Edge, SymPath, SymFill, SymPoly, SymPoints, DataPath, DataPoints, DataFill, VMultiBar, HMultiBar, Bars, Scale, VScale, HScale, Labels, VLabels, HLabels, Axis, HAxis, VAxis, XLabel, YLabel, Mesh, Graph, Plot, BarPlot, Legend, Note, gzip, zip, reshape, split, concat, pos_rect, pad_rect, rad_rect, demangle, props_repr, range, linspace, enumerate, repeat, meshgrid, lingrid, hex2rgb, rgb2hex, rgb2hsl, interpolate_vectors, interpolate_hex, interpolate_palette, exp, log, sin, cos, min, max, abs, pow, sqrt, floor, ceil, round, atan, norm, add, sub, mul, clamp, mask, rescale, sigmoid, logit, smoothstep, e, pi, phi, r2d, d2r, rounder, make_ticklabel, parseGum, renderElem, renderGum, renderGumSafe, parseHTML, injectImage, injectImages, injectScripts, aspect_invariant, random, uniform, normal, cumsum, Filter, Effect, DropShadow, Image, sum, prod, normalize, is_string, is_array, is_object, is_element
};
