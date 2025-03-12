// A plot with three bars with black borders at "A", "B", and "C". The first bar is red and is the shortest, the second bar is blue and is the tallest, while the third bar is gray.
let abar = Rect({fill: red});
let bbar = Rect({fill: blue});
let bars = BarPlot([['A', [3, abar]], ['B', [8, bbar]], ['C', 6]], {
  ylim: [0, 10], yticks: 6, title: 'Example BarPlot',
  xlabel: 'Category', ylabel: 'Value', bar_fill: '#AAA'
});
return Frame(bars, {margin: 0.3});
