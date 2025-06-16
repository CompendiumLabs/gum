// Two boxes with text in them that have black borders and gray interiors. The box in the upper left says "hello" and the box in the lower right says "world!".

const node_attr = {
  fill: '#EEE',
  size: [0.25, 0.1],
};
const hello = new Node('hello', [0.33, 0.3], node_attr);
const world = new Node('world!', [0.62, 0.7], node_attr);
return new Group([
  hello,
  world,
]);
