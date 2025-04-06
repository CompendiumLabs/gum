// a series of closely spaced squares rotating clockwise along a sinusoidal path

const sqr = x => new Rotate(new Square(), r2d*x);
const boxes = new SymPoints({
  fy: sin,
  fs: sqr,
  size: 0.4,
  xlim: [0, 2*pi],
  N: 150,
});
const graph = new Graph(boxes);
return new Frame(graph, {
  margin: 0.1,
});
