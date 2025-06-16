// make a diamond shape with two triangles, the triangle on top is red and the triangle on the bottom is blue

const tri1 = new Triangle({
  fill: red,
  stroke: 'none',
});
const tri2 = new Triangle({
  fill: blue,
  stroke: 'none',
});
const tri = new VStack([
  tri1,
  new VFlip(tri2),
]);
return new Place(tri, {
  rad: [0.2, 0.3],
});
