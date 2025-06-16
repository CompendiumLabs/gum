// A plot with three bars with black borders at "A", "B", and "C". The first bar is red and is the shortest, the second bar is blue and is the tallest, while the third bar is gray.

const abar = new Rect({
  fill: red,
});
const bbar = new Rect({
  fill: blue,
});
const bdat = [
  ['A', [3, abar]],
  ['B', [8, bbar]],
  ['C', 6],
];
const bars = new BarPlot(bdat, {
  ylim: [0, 10],
  yticks: 6,
  title: 'Example BarPlot',
  xlabel: 'Category',
  ylabel: 'Value',
  bar_fill: '#AAA',
});
return new Frame(bars, {
  margin: 0.3,
});
