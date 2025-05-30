import { GumEditor, enableResize } from './editor.js'
import { range, zip, split } from './gum.js'
import { evaluateJSX } from './eval.js'

/*
 * ui elements
 */

let left = document.querySelector('#left');
let right = document.querySelector('#right');
let mid = document.querySelector('#mid');

let code = document.querySelector('#code');
let conv = document.querySelector('#conv');
let disp = document.querySelector('#disp');
let stat = document.querySelector('#stat');

let save = document.querySelector('#save');
let copy = document.querySelector('#copy');
let docs = document.querySelector('#docs');
let spng = document.querySelector('#spng');
let font = document.querySelector('#font');

/*
 * file tools
 */

// download tools
function downloadFile(name, blob) {
    let url = URL.createObjectURL(blob);
    let element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', `${name}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// wrapper to use async
function readBlobAsync(blob) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    })
}

// load fonts for injection
async function loadFontData(path) {
    let resp = await fetch(path);
    let blob = await resp.blob();
    let data = await readBlobAsync(blob);
    return data;
}

// generate font-face text
async function makeFontFace(family, style, weight, path) {
    let data = await loadFontData(path);
    return `
    @font-face {
        font-family: "${family}";
        font-style: ${style};
        font-weight: ${weight};
        src: url("${data}");
    }
    `;
}

// get ibm font
let ibmFontFace = await makeFontFace(
    'IBMPlexSans', 'normal', 100, 'css/fonts/IBMPlexSans-Thin.ttf'
);

/*
 * svg tools
 */

// get viewBox size
function parseViewbox(elem) {
    let vbox = elem.getAttribute('viewBox');
    let [xlo, ylo, xhi, yhi] = vbox.split(' ').map(Number);
    let [width, height] = [xhi - xlo, yhi - ylo];
    return [width, height];
}

// strip border and embed fonts as data
function prepareSvg(elem, embed) {
    // get true dims
    let [width, height] = parseViewbox(elem);

    // clone and add in dimensions
    elem = elem.cloneNode(true);
    elem.setAttribute('width', width);
    elem.setAttribute('height', height);

    // remove border
    let border = elem.getElementById('border');
    border.remove();

    // embed fonts as data
    if (embed) {
        // inject font data as style
        let style = document.createElement('style');
        style.textContent = ibmFontFace;

        // insert into document
        let defs = document.createElement('defs');
        defs.appendChild(style);
        elem.prepend(defs);
    }

    return elem;
}

// export to PNG: have to be careful with devices with different pixel ratios
// https://stackoverflow.com/questions/31910043/html5-canvas-drawimage-draws-image-blurry/58345223#58345223
let drawSvg = (elem, embed) => new Promise((resolve, reject) => {
    try {
        // embed font data
        elem = prepareSvg(elem, embed);
        let width = elem.getAttribute('width');
        let height = elem.getAttribute('height');

        // get converted size
        let ratio = window.devicePixelRatio;
        let [width2, height2] = [ratio*width, ratio*height];

        // create a canvas element
        let canvas = document.createElement('canvas');
        canvas.setAttribute('width', width2);
        canvas.setAttribute('height', height2);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // fill white background
        let ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width2, height2);

        // make a url from the svg
        let svg = new XMLSerializer().serializeToString(elem);
        let blob = new Blob([svg], {type: 'image/svg+xml'});
        let url = URL.createObjectURL(blob);

        // create a new image to hold it the converted type
        let image = new Image();

        // when the image is loaded we can get it as base64 url
        image.addEventListener('load', () => {
            ctx.drawImage(image, 0, 0, width2, height2);
            URL.revokeObjectURL(url);
            canvas.toBlob(resolve);
        });

        // load the image
        image.src = url;
    } catch (err) {
        reject(err);
    }
});

/*
 * cookie tools
 */

function getCookieLong() {
    let cookies = Object.fromEntries(document.cookie
        .split(';')
        .map(x => x.trim().split('='))
        .filter(([k, v]) => k.startsWith('gum'))
        .map(([k, v]) => [k, decodeURIComponent(v)])
    );
    if ('gum' in cookies) {
        let vgum = cookies['gum'];
        let cnames = vgum.split(',').map(x => x.trim());
        let chunks = cnames.map(c => cookies[c] ?? '');
        return chunks.join('');
    } else {
        return null;
    }
}

function setCookieLong(src, maxlen=1024) {
    let chunks = split(src, maxlen).map(encodeURIComponent);
    let cnames = range(chunks.length).map(i => `gum${i}`);
    let gnames = encodeURIComponent(cnames.join(','));
    document.cookie = `gum=${gnames}; SameSite=Lax`
    for (const [n, c] of zip(cnames, chunks)) {
        document.cookie = `${n}=${c}; SameSite=Lax`;
    }
}

/*
 * event handlers
 */

save.addEventListener('click', evt => {
    let elem0 = disp.querySelector('svg');
    let elem = prepareSvg(elem0, embed_font);
    let text = new XMLSerializer().serializeToString(elem);
    let blob = new Blob([text], {type: 'text/svg'});
    downloadFile('output.svg', blob);
});

copy.addEventListener('click', evt => {
    let text = gum_editor.getConvert();
    navigator.clipboard.writeText(text);
});

let embed_font = false;
font.addEventListener('click', evt => {
    embed_font = !embed_font;
    font.classList.toggle('fill');
});

docs.addEventListener('click', evt => {
    window.open('docs.html', '_blank');
})

spng.addEventListener('click', evt => {
    let elem = disp.querySelector('svg');
    drawSvg(elem, true).then(data => {
        downloadFile('output.png', data);
    }).catch(err => {
        console.log(err);
    });
});

/*
 * editor setup
 */

// example code
let example0 = `
// fancy plot
let xlim = [0, 2*pi], ylim = [-1, 1];
let pal = x => interpolate_hex('#1e88e5', '#ff0d57', x);
let xt = linspace(0, 2, 6).slice(1).map(x => [x*pi, \`\${rounder(x, 1)} π\`]);
let f = SymPath({fy: x => -sin(x), xlim});
let s = SymPoints({
  fy: x => -sin(x), xlim, N: 21,
  fr: (x, y) => 0.03+abs(y)/20,
  fs: (x, y) => Circle({fill: pal((1+y)/2)})
});
let p = Plot([f, s], {
  xlim, ylim, xanchor: 0, aspect: 1.5, xaxis_tick_pos: 'both',
  xticks: xt, yticks: 5, ygrid: true, xlabel_offset: 0.1,
  xlabel: 'time', ylabel: 'amplitude', title: 'Inverted Sine Wave'
});
return Frame(p, {margin: 0.25});
`.trim();

// initial value
let urlParams = new URLSearchParams(window.location.search);
let source = urlParams.get('source');
let cook = getCookieLong();
let example = source ?? cook ?? example0;

// resize panels
enableResize(left, right, mid);

// temp eval
function execute(code) {
    const elem = evaluateJSX(code)
    return elem.svg()
}

// make the actual editor
let gum_editor = new GumEditor(code, conv, disp, execute, {stat, store: setCookieLong});

// set initial code input
gum_editor.setCode(example);
