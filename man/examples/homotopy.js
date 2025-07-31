// Wide-form plot depicting various curves traversing in the vertical dimension from 0 to 1. Some of the curves span the whole distance, others loop back to the origin, while others form independent loops. The x-axis is labeled "Solutions (x)" and the y-axis is labeled "Deformation path (t)".
let path1 = SymPath({fy: x => 6*(x-0.1)*(1.2-3*x), xlim: [0.1, 0.4]});
let path2 = SymPath({fx: y => 0.6 + 0.25*cos(3*y), ylim: [0, 1]});
let ellipse1 = Ellipse({pos: [0.5, 0.3], rad: [0.05, 0.1]});
let ellipse2 = Ellipse({pos: [0.8, 0.7], rad: [0.05, 0.15]});
let plot = Plot([path1, path2, ellipse1, ellipse2], {
    aspect: 2, xlim: [0, 1], ylim: [0, 1], xticks: [], yticks: [0, 1],
    xlabel: 'Solutions (x)', ylabel: 'Deformation Path (t)', label_offset: 0.05,
});
let frame = Frame(plot, {border: 1, margin: 0.15});
return frame;
