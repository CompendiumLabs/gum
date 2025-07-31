// A bar plot in the style of the Economist magazine. There are roughly 50 densely packed blue bars with random heights between 0 and 100. The y-axis has horizontal grid lines at 0, 25, 50, and 75, while the x-axis ranges between 1970 and 2020.

// plot parameters
let [xmin, xmax] = [1970, 2020];
let [ymin, ymax] = [0, 100];
let n = xmax - xmin;

// generate random data
let xvals = range(xmin, xmax);
let yvals = range(n).map(x =>
  40 + 0.6*n*cos(2*pi*x/n) + 0.3*(123*(4*x ^ x) % 100)
);

// make data bars
let bars = VBars(yvals, {
  integer: true, lim: [xmin, xmax], bar_fill: '#1e5c99', bar_stroke: 'none'
});

// tick values and labels
let xticks = range(xmin, xmin+n+10, 10);
let yticks = linspace(ymin, ymax, 5);
let labs = Points(
  yticks.map(y => [Anchor(Text(y)), [xmax+4, y+4]]), {size: 0.8}
);

// create plot
let plot = Plot([bars, labs], {
  aspect: 2.5, xlim: [xmin-1, xmax+5], ylim: [ymin, ymax], xticks, yticks,
  xaxis_tick_pos: 'down', yaxis: false, ygrid: yticks,
  title: 'Some Random Data'
});

// return framed plot
return Frame(plot, {margin: 0.1});
