// An array of partially overlapping squares depicting the letter "X". The squares for one direction are in red, while the squares in the other direction are in blue.
let [shape, size, num] = [Rect(), 0.1, 16];
let pos1 = linspace(0, 1, num).map(x => [x, x]);
let pos2 = linspace(0, 1, num).map(x => [1 - x, x]);
let p1 = Points(pos1, {shape, size, stroke: 'red'});
let p2 = Points(pos2, {shape, size, stroke: 'blue'});
let gg = Group([p1, p2], {opacity: 0.75});
return Frame(gg, {margin: 0.15});
