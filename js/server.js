import { GumEditor, enableResize } from './editor.js';
import { renderGumSafe } from './gum.js';

// svg presets
let prec = 2;
let size = 500;

// get elements
const left = document.querySelector('#left');
const right = document.querySelector('#right');
const mid = document.querySelector('#mid');
const editor = document.querySelector('#editor');
const svgout = document.querySelector('#svgout');
const output = document.querySelector('#output');
const inputs = document.querySelector('#inputs');
const generate = document.querySelector('#generate');

// placeholder for gum editor
let gumedit = null;

// make resizable
enableResize(left, right, mid);

/*
 * handle generation
 */

function disableInputs() {
    inputs.classList.add('disabled');
    generate.classList.add('disabled');
    editor.classList.add('disabled');
    svgout.classList.add('disabled');
    inputs.readonly = true;
    gumedit.setEditable(false);
}

function enableInputs() {
    inputs.classList.remove('disabled');
    generate.classList.remove('disabled');
    editor.classList.remove('disabled');
    svgout.classList.remove('disabled');
    inputs.readonly = false;
    gumedit.setEditable(true);
}

// do generation
generate.addEventListener('click', async () => {
    // disable button
    disableInputs();

    // do generation
    const prompt = inputs.value;
    const response = await fetch('/generate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({prompt}),
    });

    // read response
    const responseText = await response.text();
    gumedit.setCode(responseText, false);

    // re-enable button
    enableInputs();
});

/*
 * init editor
 */

// starting code
const starter = `// Define the plot parameters
let a = 0.5; // Controls the width of the parabolas
let N = 25; // Number of quadratic functions

// Define the ranges
let xlim = [0, 2*pi];
let ylim = [-2, 2];

// Create the quadratic functions
let quads = linspace(...xlim, N).map(x0 => {
    let y0 = sin(x0);
    return SymPath({
        fy: x => clamp(y0 - a*(x - x0)**2, ylim), opacity: 0.85,
        xlim, stroke: interpolate_hex(blue, red, rescale(x0, xlim))
    });
});

// Create line and marker points for the peaks
let shape = Circle({fill: '#888'});
let sine = SymPath({fy: sin, xlim, stroke_dasharray: 5});
let peaks = SymPoints({fy: sin, xlim, N, shape, size: 0.04});

// Create the plot
let plot = Plot([sine, peaks, ...quads], {
    aspect: phi, xlim, ylim, ytick: 5, grid: true, grid_stroke_dasharray: 3,
    xticks: [[0, '0'], [pi/2, 'π/2'], [pi, 'π'], [3*pi/2, '3π/2'], [2*pi, '2π']],
});

// Return the framed plot
return TitleFrame(plot, 'Quadratic Functions with Sine Wave Peaks', {
    margin: 0.15, title_size: 0.065, title_border_rounded: 0.03, border: 1
});`;

// init editors
gumedit = new GumEditor(editor, svgout, output, renderGumSafe);
gumedit.setCode(starter, true);
