// the text "hello!" in a frame with a dashed border and rounded corners

const text = new Text('hello!');
return new Frame(text, {
  padding: 0.1,
  border: 1,
  margin: 0.1,
  border_stroke_dasharray: 5,
  border_rounded: 0.05,
});
