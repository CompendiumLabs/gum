// Two by two table with columns "Product and "¬ Product" and rows "Patent" and "¬ Patent". The cell values in the table are "Protected Innovation" and "Strategic Patents" in the first row and "Secrecy" and "Incation" in the second row. The column labels are in blue and the row labels are in red.
function make_node(t, c, b, s) {
  const text = new VStack(t.map(s => new Text(s, {stroke: c})), {expand: false});
  const place = new Place(text, {rad: [0.4, s*t.length]});
  return new Frame(place, {border: b});
}
const [b, c] = [['Product'], ['¬ Product']].map(s => make_node(s, blue, 0, 0.17));
const [d, g] = [['Patent'], ['¬ Patent']].map(s => make_node(s, red, 0, 0.12));
const [e, f, h, i] = [['Protected', 'Innovation'], ['Strategic', 'Patents'], ['Secrecy'], ['Inaction']].map(
  s => make_node(s, 'black', 1, 0.12)
);
const grid1 = new VStack([
  [new HStack([[Spacer(), 0.25], b, c]), 0.25],
  [new HStack([[d, 0.25], e, f]), 0.75/2],
  [new HStack([[g, 0.25], h, i]), 0.75/2],
]);
return new Frame(grid1, {aspect: phi, margin: 0.05});

// A plot of two lines: one blue one labeled "No Stretegic Patents" and one red one labeled "Strategic Patents". The x-axis is labeled "Firm Productivity" and the y-axis is labeled "Complementarity".
const xlim = [1, 2]; const ylim = [0, 1];
const line1 = new SymPath({fy: x => 0.5/x**2, xlim, stroke: '#ff0d57', stroke_width: 2});
const line2 = new SymPath({fy: x => 1 - 0.5*1/x**2, xlim, stroke: '#1e88e5', stroke_width: 2});
const note1 = new Place(
  new Node(['No Strategic', 'Patents'], {border: 0}), {pos: [1.3, 0.84], rad: 0.14}
);
const note2 = new Place(
  new Node(['Strategic', 'Patents'], {border: 0}), {pos: [1.3, 0.16], rad: 0.11}
);
const dot = new Place(new Dot(), {pos: [1, 0.5], rad: 0.01});
const plot = new Plot([line1, line2, note1, note2, dot], {
  xlim, ylim, aspect: 1.2, xticks: [], yticks: [],
  xlabel: 'Firm Productivity', ylabel: 'Complementarity',
  xlabel_offset: 0.07, ylabel_offset: 0.07,
});
const frame = new Frame(plot, {margin: [0.2, 0.05, 0.1, 0.15]});
return frame;

// A swirl of 24 shaded in sine waves. Each wave is a different color ranging from red to blue.
// define parameters
const xlim = [0, 2*pi]; const ylim = [-1, 1];
const decay = x => exp(-0.1*x) * sin(x);
const pal = th => interpolate_hex(red, blue, abs(th-180)/180);
// make individual blades
const wave = th => new SymFill({fy1: decay, fy2: 0, xlim, fill: pal(th), opacity: 0.5});
const graph = th => new Graph(wave(th), {aspect: phi, xlim, ylim});
// swirl blades around
const blades = new Group(linspace(0, 360, 24).slice(1).map(th =>
  [graph(th), {pos: [0.75, 0.5], rad: 0.25, rotate: th, pivot: [0, 0.5]}]
), {clip: false});
// frame the result
return new Frame(blades, {
  padding: 0.05, margin: 0.1, border: 1, border_rounded: 0.05,
  border_fill: '#EEE', border_stroke: '#999'
});
