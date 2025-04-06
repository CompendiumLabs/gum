// plot two lines: (1) a sine wave in red; (2) the same sine wave with a lower amplitude higher frequency sine wave added on top
let xlim = [0, 2*pi];
let line1 = SymPath({
    fy: sin, xlim, stroke: red, stroke_width: 2
});
let line2 = SymPath({
    fy: x => sin(x) + 0.2*sin(5*x), xlim, stroke: blue, stroke_width: 2
});
let plot = Plot([line1, line2], {
    aspect: phi, grid: true, ylim: [-1.5, 1.5]
});
return Frame(plot, {margin: 0.2});