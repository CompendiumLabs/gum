// A network with a node on the left saying "hello world" and two nodes on the right saying "hello" and "world". There are arrows going from the left node to each of the right nodes. The nodes have gray backgrounds and rounded corners.

const node_args = {
  fill: '#EEE',
  border_rounded: 0.05,
  size: [0.25, 0.15],
};
const node1 = new Node(['hello', 'world'], [0.4, 0.5], node_args);
const node2 = new Node('hello', [1.4, 0.25], node_args);
const node3 = new Node('world', [1.6, 0.75], node_args);

const edge_args = {
  arrow_size: [0.07, 0.05],
};
const edge1 = new Edge([node1, 'n'], node2, edge_args);
const edge2 = new Edge([node1, 's'], node3, edge_args);

const group = new Group([
  node1,
  node2,
  node3,
  edge1,
  edge2,
], {
  coord: [0, 0, 2, 1],
  aspect: phi,
});

return new Frame(group, {
  padding: 0.05,
  border: 1,
  margin: 0.1,
});
