// A 20x25 pixel icon of two rectangles shaped like pieces of paper partially overlaid on one another.
let x = 0.35;
let rects = Points(
  [[x, x], [1-x, 1-x]],
  {shape: Rect(), size: x}
);
let frame = Frame(rects, {margin: 0.05});
return SVG(frame, {size: [20, 25]});
