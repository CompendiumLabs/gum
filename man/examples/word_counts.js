// A horizontal grid of boxes, each containing an integer. On top of each box is a label indicating which word it is associated with, such as "quick" or "fox". Near the end of the grid, there is an ellipsis box indicating there are many omitted words inbetween.

// define cell data
let data = [
  ['the', '2'], ['quick', '1'], ['brown', '2'], ['fox', '1'],
  ['jumped', '1'], ['over', '1'], ['dog', '1'], ['lazy', '0'],
  ['plum', '0'], ['house', '0']
];

// make stacked cell array
let cells = data.map(([w, c]) => VStack([
  TextFrame(w, {aspect: 1, border: 0, padding: [0, 0.8]}),
  TextFrame(c, {padding: 0.4, aspect: 1})
]));

// splice in ellipsis
let dots = HStack(repeat(Dot(), 3), {spacing: 1});
let elps = Frame(dots, {aspect: 1, padding: 1.5});
cells.splice(8, 0, VStack([1/2, elps]));

// returned cells with margin
return Frame(HStack(cells), {margin: 0.05});
