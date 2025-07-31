// A plot of a curve spiraling inwards counterclockwise, with axes in both directions ranging from -1 to 1.
let alpha = 0.1;
let tlim = [0, 50];
let s = SymPath({
  fx: t => exp(-alpha*t) * cos(t),
  fy: t => exp(-alpha*t) * sin(t),
  tlim, N: 1000,
});
let p = Plot(s, {xlim: [-1, 1], ylim: [-1, 1]});
return Frame(p, {margin: 0.15});
