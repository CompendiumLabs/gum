// draw a plus symbol in a frame and place it in the bottom left corner

const plus = new Group([
  new VLine(0.5),
  new HLine(0.5),
]);
const frame = new Frame(plus, {
  padding: 0.2,
  border: 1,
  border_rounded: 0.05,
  fill: '#EEE',
});
return new Place(frame, {
  pos: [0.3, 0.7],
  rad: 0.1,
});
