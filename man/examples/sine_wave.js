// A plot of a sin function from 0 to 2\*pi. The y-axis has ticks from -1 to 1. The x-axis has ticks from 0 to 2\*pi labeled as fractions of pi and is anchored at y\=0. There are light gray dashed grid lines aligned with the ticks.
let line = SymPath({fy: x => -sin(x), xlim: [0, 2*pi]});
let xticks = linspace(0, 2, 6).slice(1).map(x => [x*pi, `${rounder(x, 1)} π`]);
let plot = Plot(line, {
  aspect: phi, xaxis_pos: 0, xticks, yticks: 5, grid: true,
  xlabel: 'phase', ylabel: 'amplitude', title: 'Inverted Sine Wave',
  xlabel_offset: 0.1, xaxis_tick_pos: 'both', grid_stroke_dasharray: 3
});
return Frame(plot, {margin: 0.25});
