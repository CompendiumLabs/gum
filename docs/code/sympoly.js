// A circle with an oscilating radius. The circle has a solid black border and is filled in with blue. The result should look like a splat.

const [freq, amp] = [5, 0.25];
const famp = t => 1 + amp * sin(freq*t);
const poly = new SymPoly({
  fx: t => famp(t) * cos(t),
  fy: t => famp(t) * sin(t),
  tlim: [0, 2*pi],
  N: 500,
  fill: blue,
  opacity: 0.75,
});
const graph = new Graph(poly, {
  aspect: 1,
});
return new Frame(graph, {
  padding: 0.1,
  border: 1,
  margin: 0.1,
  border_rounded: 0.05,
  border_fill: '#EEE',
});
