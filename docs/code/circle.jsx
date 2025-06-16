// a circle placed off-center in a box

const circle = new Circle({
  pos: [0.4, 0.4],
  rad: 0.25,
});
return new Frame(circle, {
  margin: 0.1,
  border: 1,
});
