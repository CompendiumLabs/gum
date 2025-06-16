// one large donut in a frame stacked on top of two smaller side-by-side framed donuts

const d = new TextFrame('🍩');
const h = new HStack([d, d]);
const v = new VStack([d, h]);
return new Frame(v, {
  margin: 0.1,
});
