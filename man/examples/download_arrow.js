// A 25x25 pixel icon in which an arrow is pointing downward into a curved tray.
let [mid, rad] = [0.25, 0.06];
let arrow = Arrow(-90, {
  pos: [0.5, 0.85], head: 0.25, tail: 0.75
});
let base = Bezier2Path([0, 1-mid], [
  [0, 1-rad], [[rad, 1], [0, 1]], [1-rad, 1], [[1, 1-rad], [1, 1]], [1, 1-mid]
]);
let shape = Group([base, arrow]);
let frame = Frame(shape, {margin: 0.1});
return SVG(frame, {size: 25, prec: 2});
