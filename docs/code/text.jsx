// The text "Hello World!" in bold is placed near the botton left of the figure.

const text = new Text('Hello World!', {
  font_weight: 'bold',
});
return new Place(text, {
  pos: [0.35, 0.7],
  rad: 0.2,
});
