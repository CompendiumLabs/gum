// two ellipses, one wider and one taller

const e1 = new Ellipse({
  pos: [0.3, 0.2],
  rad: [0.2, 0.1],
});
const e2 = new Ellipse({
  pos: [0.6, 0.6],
  rad: [0.2, 0.25],
});
return new Group([
  e1,
  e2,
]);
