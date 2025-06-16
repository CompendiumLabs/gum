// plot two lines: (1) a sine wave in red; (2) the same sine wave with a lower amplitude higher frequency sine wave added on top (in blue)

const xlim = [0, 2*pi];
const func = x => sin(x) + 0.2*sin(5*x);
const line1 = new SymPath({
  fy: sin,
  xlim,
  stroke: red,
  stroke_width: 2,
});
const line2 = new SymPath({
  fy: func,
  xlim,
  stroke: blue,
  stroke_width: 2,
});
const plot = new Plot([line1, line2], {
  aspect: phi,
  grid: true,
  ylim: [-1.5, 1.5],
});
return new Frame(plot, {
  margin: 0.2,
});
