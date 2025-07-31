// A plot of two lines that are shaded below. One line is a steep exponential in blue and the other line is a more shallow exponential in red. The x-axis has tick labels at "1" and "B" and the "B" tick has associated solid vertical line. The y-axis has a tick at "0". The x-axis has the lable "Innovation Step Size" and the y-axis "Density".

// define parameters
let [αi, αr] = [8, 2]; let B = 1.3;
let xlim = [xlo, xhi] = [1, 2]; let ylim = [ylo, yhi] = [0, sqrt(αi)];
let [fi, fr] = [αi, αr].map(α => (x => sqrt(α)*x**(-α-1)));

// make shaded areas and lines
let si = SymFill({fy1: 0, fy2: fi, xlim, fill: blue, opacity: 0.4});
let sr = SymFill({fy1: 0, fy2: fr, xlim, fill: red, opacity: 0.4});
let [bi, br] = [fi, fr].map(f => SymPath({fy: f, xlim, stroke: '#333'}));
let bline = VLine(B, {lim: ylim, stroke_width: 2});

// plot it and frame it
let plot = Plot([si, sr, bi, br, bline], {
  aspect: phi, grid: true,
  xticks: [[1, '1'], [B, 'B'], [2, '']],
  yticks: [[0, '0'], [sqrt(αi), '']],
  xlabel: 'Innovation Size', ylabel: 'Density',
  xlabel_offset: 0.13, ylabel_offset: 0.05
});
return Frame(plot, {margin: 0.2});
