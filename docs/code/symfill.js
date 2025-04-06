// a decaying sine wave filled in with blue

const decay = x => exp(-0.1*x) * sin(x);
const fill = new SymFill({
  fy1: decay,
  fy2: 0,
  xlim: [0, 6*pi],
  fill: blue,
  fill_opacity: 0.6,
  N: 250,
});
const graph = new Graph(fill, {
  aspect: phi,
});
return new Frame(graph, {
  margin: 0.1,
});
