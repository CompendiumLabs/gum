let taper = x => exp(-0.75*x*x);
let packet = (x, x0) => sin(x-x0) * taper(x);
let lines = linspace(0, 1, 300).map(z =>
  SymPath({
    fy: x => packet(x, 2*pi*z), xlim: [-pi, pi],
    stroke: interpolate_hex(red, blue, z),
    stroke_width: 2
  })
);
let graph = Graph(lines, {
  aspect: exp(1), xlim: [-pi, pi], ylim: [-1, 1],
});
return Frame(graph, {
  padding: 0.1, margin: 0.1, fill: '#222', rounded: 0.1,
  border_stroke: '#777', border_stroke_width: 5
});
