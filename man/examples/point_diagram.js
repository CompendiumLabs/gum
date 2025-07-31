// Two horizontal lines connected at the left with a vertical line. The top line contains mostly blue circles and one red circle. The bottom line contains mostly red circles that are spaced more widely. There is a thin box on the top line labeled "Low B" and a wider box on the bottom line labeled "High B". At the bottom of the figure there is the text "Productivity >>>".

// line and point positions
let [B1, B2] = [0.05, 0.2];
let [size, bsize] = [0.02, 0.1];
let [y1, y2] = [0.3, 0.7];
let [b1, b2] = [0.44, 0.65];
let p1 = [0.08, 0.17, b1, 0.52, 0.59];
let p2 = [0.2, 0.4, b2, 0.95];

// line structure
let base = VLine(0);
let prods = [y1, y2].map(y => HLine(y, {stroke: 'black'}));

// points on lines
let steps1 = Points(p1.map(x => [x, y1]), {shape: Circle({fill: blue}), size});
let steps1a = Points([[0.36, y1]], {shape: Circle({fill: red}), size: 0.02});
let steps2 = Points(p2.map(x => [x, y2]), {shape: Circle({fill: red}), size});

// gray rectangles
let pat1 = Rect({pos: [b1+0.5*B1, y1], rad: [0.5*B1, bsize], fill: '#DDD', opacity: 0.75});
let pat2 = Rect({pos: [b2+0.5*B2, y2], rad: [0.5*B2, bsize], fill: '#DDD', opacity: 0.75});

// labels
let label1 = Note('"Low B"', {pos: [0.47, y1-0.15], rad: 0.06});
let label2 = Note('"High B"', {pos: [0.753, y2-0.15], rad: 0.06});
let xlabel = Note('Productivity >>>', {pos: [0.5, 1], rad: 0.1});

// group together and frame
let group = Group([
  base, ...prods, pat1, pat2, steps1, steps2, steps1a, label1, label2, xlabel
], {aspect: 1.3});
return Frame(group, {margin: 0.1});
