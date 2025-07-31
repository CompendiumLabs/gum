# Teaching Examples

## Using iterations, SymPath, and SymPoints

Prompt: Plot a series of negative quadratics whose peaks form a sine wave.

```javascript
// Define the plot parameters
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
    margin: 0.15, label_size: 0.06, label_border_rounded: 0.03, border: 1
});
```

## Using color palettes and rescale

Prompt: Draw a plot of sine waves at various frequencies that are spaced logarithmically. The lines are colored from blue to red according to their frequency.

```javascript
// Generate logarithmically spaced frequencies
let flim_log = [0, 0.6]; let flim = flim_log.map(exp);
let freqs = linspace(...flim_log, 40).map(exp);
let xlim = [0, 2*pi]; let ylim = [-1, 1];

// Define colors for each wave
let palette = f => interpolate_hex(red, blue, rescale(f, flim));

// Create sine waves
let waves = freqs.map(f => {
    return SymPath({
        fy: x => sin(f * x), opacity: 0.6,
        xlim, stroke: palette(f),
    });
});

// Create the plot
let plot = Plot([...waves], {
    aspect: phi, xlim, ylim, yticks: 5, grid: true, grid_stroke_dasharray: 3,
    xticks: [[0, '0'], [pi/2, 'π/2'], [pi, 'π'], [3*pi/2, '3π/2'], [2*pi, '2π']],
});

// Add a frame and return the result
return TitleFrame(plot, 'Sine Waves at Various Frequencies', {
    padding: 0.15, margin: 0.1,
    label_size: 0.05, label_border_rounded: 0.03,
    border_opacity: 0.25, border_rounded: 0.01
});
```

## Simple and Elegant Plots

Prompt: Plot a cubic function with its local extrema labeled and a dot at the origin.

```javascript
// Define the cubic function
let xlim = [-3, 3]; let ylim = [-4, 4];
let f = x => mask(x*x*x - 3*x, ylim);
let curve = SymPath({fy: f, xlim, N: 200});

// Calculate extrema points
let [x1, x2] = [-1, 1];
let [y1, y2] = [f(x1), f(x2)];

// Create markers for extrema
let markers = Points([[x1, y1], [x2, y2]],{
    shape: Circle({fill: 'white'}), size: 0.05
});

// Show a single dot for the origin
let zero = Place(Dot(), {pos: [0, 0], rad: 0.04});

// Create labels for extrema
let label1 = Note('Local Maximum', {pos: [x1, y1+0.5], rad: 0.7});
let label2 = Note('Local Minimum', {pos: [x2, y2-0.5], rad: 0.7});

// Combine all elements into a plot
let plot = Plot([curve, markers, label1, label2, zero], {
    xlim, ylim, aspect: phi, xticks: 7, yticks: 5,
    grid: true, grid_stroke_dasharray: 4
});

// Frame the plot
return TitleFrame(plot, 'Cubic Function with Local Extrema', {
  margin: 0.15, title_size: 0.06, title_border_rounded: 0.05
});
```

## Network Diagrams

Prompt: Draw a network diagram with two rows. The first row contains 3 nodes labeled "Wikipedia Entry N" for N=1 through 3. The second row contains 5 nodes labeled "Scientific Paper N" for N=1 through 5. The two rows are fully connected in the manner of a bipartite graph.

```javascript
// Define constants
let N = 3; let M = 5;

// Define the nodes for the two rows
let wikiNodes = range(N).map(i =>
  [`w${i+1}`,['Wikipedia', `Entry ${i+1}`], [(i+1)/(N+1), 0.28]]
);
let paperNodes = range(M).map(i =>
  [`p${i+1}`, ['Scientific', `Paper ${i+1}`], [(i+1)/(M+1), 0.72]]
);
let nodes = [...wikiNodes, ...paperNodes];

// Create edges for the bipartite graph
let edges = meshgrid(range(N), range(M)).map(([i, j]) =>
  [[`w${i+1}`, 'south'], [`p${j+1}`, 'north']]
);

// Create the network
let network = Network(nodes, edges, {
  size: 0.07, node_fill: '#EEE', node_border_rounded: 0.05, edge_opacity: 0.4
});

// Frame the entire diagram
return TitleFrame(network, 'Wikipedia and Science', {
  margin: 0.1, aspect: 1.5, title_border_rounded: 0.03
});
```

## Plots with Lines and Markers

Prompt: Create a plot of a spiral with sparkles.

```javascript
// Set up spiral
let n_sparkles = 20; let stroke = blue;
let tlim = [0, 4*pi]; let xlim = [-1, 1]; let ylim = [-1, 1];
let fx = t => rescale(t, tlim) * cos(t);
let fy = t => rescale(t, tlim) * sin(t);

// Create a sparkle path
let spiral = SymPath({fx, fy, tlim, N: 200, stroke, stroke_width: 2});
let sparkles = SymPoints({fx, fy, tlim, N: 25, stroke, shape: Text('✨'), size: 0.07});

// Combine spiral and sparkles in a plot
let plot = Graph([spiral, sparkles], {xlim, ylim, xticks: 0, yticks: 0});

// Add a frame around the plot
return TitleFrame(plot, 'Sparkle Motion', {
  margin: 0.1, padding: 0.05, border_rounded: 0.02, title_size: 0.06
});
```

## Advanced SymPoints Usage

Prompt: Create a spiral using dots that transition from red in the center to blue at the edges. Make it so the spiral converges asymptotically to a point at the center and a circle at the edge.

```javascript
// Set up spiral
let tlim = [-15*pi, 15*pi];
let frad = t => 0.9 * (2/pi) * atan(exp(0.1*t));
let fpal = t => interpolate_hex(red, blue, frad(t));
let fx = t => frad(t) * cos(t);
let fy = t => frad(t) * sin(t);
let fs = (x, y, t) => Dot({color: fpal(t)});

// Create a path
let spiral = SymPoints({fx, fy, fs, tlim, N: 1000, size: 0.005});
let circle = Circle({pos: [0, 0], rad: 1, stroke: '#ccc', stroke_dasharray: 4});
let plot = Graph([spiral, circle], {xlim: [-1, 1], ylim: [-1, 1]});

// Add a frame
return TitleFrame(plot, 'Sparkle Motion', {
  margin: 0.1, padding: 0.05, border_rounded: 0.02, title_size: 0.06,
  border_stroke: '#999'
});
```

## Multiple Gridded Plots

Prompt: Create a grid plot of sine waves at various frequencies that are spaced logarithmically. The lines are colored from blue to red according to their frequency. Frame the entire thing with the title "Different Frequencies".

```javascript
// Create frequency range
let flim_log = [0, log(4)]; let flim = flim_log.map(exp);
let freqs = linspace(...flim_log, 9).map(exp);

// Create plots
let plots = freqs.map(f => {
  let color = interpolate_hex(red, blue, rescale(f, flim));
  let path = SymPath({fy: x => sin(f*x), xlim: [0, 2*pi], stroke: color});
  let plot = Graph(path, {padding: 0.15, flex: true});
  let frame = Frame(plot, {border: 1});
  return frame;
});

// Create grid and frame
let grid = Grid(split(plots, 3), {spacing: 0.1});
return TitleFrame(grid, 'Different Frequencies', {
  margin: 0.1, padding: 0.1, border_rounded: 0.02, title_size: 0.055
});
```

## Using LaTeX in Frames

Prompt: Create a plot of the function \( f(x) = e^{-x^2} \) and label it with a title in LaTeX.

```javascript
let xlim = [-3, 3]; let ylim = [0, 1.5];
let func = x => exp(-x*x);
let line = SymPath({fy: func, xlim, fill: '#eee'});
let plot = Plot(line, {aspect: phi, xlim, ylim, yticks: 4, grid: true});
let tex = Latex('f(x) = \\exp(-x^2)');
let frame = TitleFrame(plot, tex, {margin: 0.15, title_size: 0.08, adjust: false});
return frame;
```

## Sine Wave with Cosine Epicycle

Prompt: Create a plot of a sine wave with a little cosine epicycle. Make the line black and the markers blue.

```javascript
// Define the function for our wave
let xlim = [0, 2*pi]; let ylim = [-1.5, 1.5];
let wave = x => sin(x) + 0.2 * cos(5*x);

// Create the main path
let path = SymPath({
  fy: wave, xlim, N: 200, stroke: 'black', stroke_width: 2
});

// Create markers
let markers = SymPoints({
  fy: wave, xlim, N: 20, size: 0.05, shape: Circle({fill: blue})
});

// Create the plot
let xticks = [[0, '0'], [pi/2, 'π/2'], [pi, 'π'], [3*pi/2, '3π/2'], [2*pi, '2π']];
let plot = Plot([path, markers], {
  aspect: phi, xlim, ylim, xticks: xticks, yticks: 5,
  grid: true, grid_stroke_dasharray: 4, grid_opacity: 0.4
});

// Create the final figure with a title
return TitleFrame(plot, 'Sine Wave with Cosine Epicycle', {
  margin: 0.2, adjust: false, title_size: 0.07
});
```

## Spirograph!!

Prompt: Create a spirograph plot with oscillating color markers.

```javascript
// Spirograph parameters
let R = 0.8;  // Fixed circle radius
let r = 0.3;  // Moving circle radius
let a = 0.7;  // Distance from center of moving circle
let numRotations = 80;  // Number of rotations to make

// Parametric equations for spirograph
let x = t => (R - r) * cos(t) + a * cos((R - r) * t / r);
let y = t => (R - r) * sin(t) - a * sin((R - r) * t / r);

// Color oscillation function
let color = t => interpolate_hex(red, blue, rescale(sin(t/numRotations), [-1, 1]));
let shape = (x, y, t) => Circle({fill: color(t)});

// Create the spirograph with oscillating color markers
let spirograph = SymPoints({
    fx: x, fy: y, tlim: [0, 2 * pi * numRotations],
    N: 16 * numRotations, size: 0.05, fs: shape
});

// Create the plot
let plot = Graph(spirograph, {aspect: 1, xlim: [-1, 1], ylim: [-1, 1]});
return Frame(plot, {margin: 0.2, border: 1, border_opacity: 0.5});
```
