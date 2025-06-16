// A plot of an inverted sine wave where the line markers are sized in proportion to the amplitude and the color ranges from blue to red depending on the phase. The x-axis ticks are labeled with multiples of π. The x-axis is labeled "phase" and the y-axis is labeled "amplitude". The title is "Inverted Sine Wave".

const xlim = [0, 2*pi];
const ylim = [-1, 1];
const pal = x => interpolate_hex(blue, red, x);

const func = x => -sin(x);
const shape = (x, y) => new Circle({
  fill: pal((1+y)/2),
  rad: (1+abs(y))/2,
});

const line = new SymPath({
  fy: func,
  xlim,
});
const points = new SymPoints({
  fy: func,
  fs: shape,
  xlim,
  N: 21,
  size: 0.04,
});

const xticks = linspace(0, 2, 6).slice(1).map(
  x => [x*pi, `${rounder(x, 1)} π`]
);
const plot = new Plot([line, points], {
  xlim,
  ylim,
  xaxis_pos: 0,
  aspect: 1.5,
  xaxis_tick_pos: 'both',
  xticks,
  yticks: 5,
  xgrid: true,
  ygrid: true,
  xlabel_offset: 0.1,
  xlabel: 'phase',
  ylabel: 'amplitude',
  title: 'Inverted Sine Wave',
});

return new Frame(plot, {
  margin: 0.25,
});
