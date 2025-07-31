// A plot showing two exponentials with only an x-axis with ticks ranging from -0.5 to 1.5. There is a steep exponential decay starting at 0 in blue on the top side of the axis and a shallow exponential decay starting at 0 on the bottom side in red.

// define params
let [αi, αr] = [4, 2];
let xlim = [-0.5, 1.5];
let xlim1 = [0, 1.5];

// make shaded lines
let [fi, fr] = [αi, αr].map(α => (x => α*exp(-α*x)));
let si = SymFill({fy1: fi, fy2: 0, xlim: xlim1, fill: blue, opacity: 0.5});
let sr = SymFill({fy1: x => -fr(x), fy2: 0, xlim: xlim1, fill: red, opacity: 0.5});

// plot and frame
let plot = Plot([si, sr], {
  aspect: 2, xaxis_pos: 0, xlim, yaxis: false,
  xticks: [-0.5, 0, 0.5, 1, 1.5], xaxis_tick_pos: 'both'
});
return Frame(plot, {margin: 0.1});
