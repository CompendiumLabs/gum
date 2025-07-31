// Four wide nodes with the words "scented", "large", and "liquid" (in blue), and "OxiClean". There are arrows down to four more nodes with the same words but "liquid" is changed to "pods" (in red). The arrow for the changed node is filled in.

// define cell data
let cells1 = [['scented'], ['large'], ['liquid', {text_stroke: 'blue'}], ['OxiClean']];
let cells2 = [['scented'], ['large'], ['pods', {text_stroke: 'red'}], ['OxiClean']];
let aprops = [{}, {}, {arrow_fill: '#CCC', arrow_base: true}, {}]

// make cells and arrows
let row1 = HStack(cells1.map(([s, a]) => TextFrame(s, {aspect: 3, padding: 0.2, ...a})));
let row2 = HStack(cells2.map(([s, a]) => TextFrame(s, {aspect: 3, padding: 0.2, ...a})));
let arrow1 = HStack(aprops.map(a =>
  Arrowpath([0.5, 0], [0.5, 1], {arrow: true, arrow_size: 0.13, ...a})
));

// stack and frame
let rows = VStack([[row1, 0.25], [arrow1, 0.5], [row2, 0.25]]);
return Frame(rows, {margin: 0.1});
