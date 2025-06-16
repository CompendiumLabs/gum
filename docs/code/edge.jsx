// A curved line going from the upper left to the lower right. The left side of the line has a red arrow facing left and the right side has a blue arrow facing right. Both arrows are triangular with black borders.

const node1 = new Node('hello', [0.2, 0.3]);
const node2 = new Node('world', [0.8, 0.7]);
const edge = new Edge(node1, node2, {
  arrow: true,
  arrow_base: true,
  arrow_beg_fill: red,
  arrow_end_fill: blue,
});
return new Group([
  node1,
  node2,
  edge,
]);
