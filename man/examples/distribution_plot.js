// A plot with an exponentially decaying line. It is divided horizontally at a point "R" with a dashed line. To the left of "R" it is shaded dark gray, and to the right of "R" it is shaded light gray. There are also x-axis ticks a "0" and "1" and y-axis ticks at "0". The x-axis is labeled "Worker Index" and the y-axis is labeled "Research Aptitude". The graph is framed with the title "Research Aptitude Distribution".

// define params
let [β, R] = [0.5, 0.2];
let xlim = [xlo, xhi] = [0.0001, 1];
let ylim = [ylo, yhi] = [0, 5];
let f = x => min(yhi, (1-β)*x**(-β));

// create lines
let sr = SymFill({fy1: 0, fy2: f, xlim: [xlo, R], fill: '#555', opacity: 0.4, N: 250});
let sp = SymFill({fy1: 0, fy2: f, xlim: [R, xhi], fill: '#BBB', opacity: 0.4, N: 250});
let b = SymPath({fy: f, xlim, stroke: '#333', N: 250});
let bline = VLine(R, {lim: ylim, stroke_dasharray: 3});

// plot and frame
let plot = Plot([sr, sp, b, bline], {
  aspect: 1.5, ylim, xlabel_offset: 0.1, ylabel_offset: 0.05,
  xticks: [[0, '0'], [1, '1'], [R, 'R'], [2, '']], yticks: [0],
  xlabel: 'Worker Index', ylabel: 'Research Aptitude'
});
return TitleFrame(plot, 'Research Aptitude Distribution', {margin: 0.2});
