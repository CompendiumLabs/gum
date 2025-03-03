// set parameters
let xlim = [-2, 2]; let ylim = [-1.5, 1.5];
let wave = (x, th) => exp(-2*x*x) * sin(2*pi*(x-th));
let pal = x => interpolate_hex(red, blue, 4*x*(1-x));

// make waves
let paths = linspace(0, 1, 7).map(th =>
    SymPath({fy: x => wave(x, th), xlim, stroke: pal(th), N: 200})
);

// Create the plot with appropriate labels and grid
let plot = Plot(paths, {aspect: phi, xlim, ylim, xticks: 0, yticks: 0});

// Add margin and return
return TitleFrame(plot, 'Wavelet Mesh', {margin: 0.2});
