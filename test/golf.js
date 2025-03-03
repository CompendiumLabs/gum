import { Continuous, Discrete } from "../js/gum";

// gum logo
let gum = 'gum'.split('').map(Text).map(t => Frame(t, {
  border: 1, padding: [0, -0.35, 0, 0], border_stroke: 'red', adjust: false
}));
return Frame(HStack(gum), {
  border: 1, margin: 0.15, border_stroke: 'blue', border_stroke_dasharray: [10, 6]
});

// gum favicon
let make_node = t => Node(t, {aspect: 1, fill: '#EEE'});
let [g, u, m] = 'GUM'.split('').map(make_node);
let s = VStack([g, HStack([u, m])], {expand: false});
let f = Frame(s, {margin: 0.02});
return SVG(f, {size: 100});

// save icon
let [mid, rad] = [0.25, 0.06];
let [apt, asz] = [0.17, 0.25];
let vline = VLine({pos: 0.5, ymin: 0, ymax: 1-apt});
let arrow = Polyline([[0.5-asz, 1-apt-asz], [0.5, 1-apt], [0.5+asz, 1-apt-asz]]);
let base = Bezier2Path([0, 1-mid], [
  [0, 1-rad], [[rad, 1], [0, 1]], [1-rad, 1], [[1, 1-rad], [1, 1]], [1, 1-mid]
]);
let shape = Group([vline, base, arrow]);
let frame = Frame(shape, {margin: 0.1});
return SVG(frame, {size: 25, prec: 2});

// copy icon
let x = 0.35;
let s = Points(
  [[x, x], [1-x, 1-x]],
  {shape: Rect(), size: x}
);
let f = Frame(s, {margin: 0.05});
return SVG(f, {size: [20, 25]});

// square arrangement
let n = 16;
let r = Rect();
let p1 = Points(
    linspace(0, 1, n).map(x => [x, x]),
    {shape: r, size: 0.1, stroke: 'red'}
);
let p2 = Points(
    linspace(0, 1, n).map(x => [1 - x, x]),
    {shape: r, size: 0.1, stroke: 'blue'}
);
let gg = Group([p1, p2], {opacity: 0.75});
return Frame(gg, {margin: 0.15});

// starburst pattern
let n = 12;
let r = Rect();
let s = Group(
  range(-90, 90, 180/n).map(t => Ray(t))
);
let hs = HStack([s, s]);
let vs = VStack([hs, hs]);
let gg = Group([vs, r]);
return Frame(gg, {border: 1, margin: 0.05});

// basic text
let t = Text('hello');
let f = Frame(t, {padding: 0.1, margin: 0.1, border: 1});
return f;

// combined text
let t1 = Text('🍄');
let t2 = Text('gello');
B = x => Frame(x, {padding: 0.15, border: 1});
let t = HStack([B(t1), B(t2)], {expand: true});
return Frame(t, {padding: 0.05});

// rect node
let n = Node('hello');
let f = Frame(n, {margin: 0.1});
return f;

// letter stack
let a = Node('A');
let n1 = VStack([a, a]);
let n2 = HStack([n1, a]);
let f = Frame(n2, {margin: 0.1});
return f;

// symbolic path
let s = SymPath({
  fx: t => exp(-0.1*t)*cos(t),
  fy: t => exp(-0.1*t)*sin(t),
  tlim: [0, 100], N: 1000,
});
let p = Plot(s, {xlim: [-1, 1], ylim: [-1, 1]});
let f = Frame(p, {margin: 0.1});
return f;

// basic plot
let a = 0.027;
let s = SymPath({
  fx: t => exp(-a*t)*cos(t),
  fy: t => exp(-a*t)*sin(t),
  xlim: [-2, 2], ylim: [-1.1, 1.1],
  tlim: [0, 150], N: 100,
});
let p = Plot(s, {yticks: 7});
return Frame(p, {padding: 0.13});

// goofy plot
let a = 0.027;
let s = SymPath({
  fx: t => exp(-a*t)*cos(t),
  fy: t => exp(-a*t)*sin(t),
  xlim: [-1, 1], ylim: [-1, 1],
  tlim: [0, 150], N: 100,
});
let xt = linspace(-1, 1, 10).map(t => [t, '🍩']);
let yt = linspace(-1, 1, 10).map(t => [t, '🐋']);
let p = Plot(s, {xticks: xt, yticks: yt, ticksize: 0.03});
return Frame(p, {margin: 0.1});

// annotated plot
let a = 0.027;
let s1 = Line({x1: -2, y1: 2, x2: 2, y2: -2});
let s2 = SymPath({fy: t => 2*(sqrt(2+t)-1), xlim: [-2, 2], N: 500});
let s3 = VLine(0, {y1: -2, y2: 0, stroke_dasharray: 3, stroke: 'blue'});
let s4 = HLine(0, {x1: -2, x2: 0, stroke_dasharray: 3, stroke: 'red'});
let sc = Points([
  [0, 0], [2, 2], [-2, -2], [2, -2], [-2, 2], [0, -2], [-2, 0]
]);
let p = Plot([s1, s2, s3, s4, sc], {
  xlim: [-2.5, 2.5], ylim: [-2.5, 2.5],
  xticks: [-2, -1, [0, '🍩'], 1, 2],
  yticks: [-2, -1, [0, '🐋'], 1, 2],
  ticksize: 0.04
});
let f = Frame(p, {padding: [0.15, 0.05, 0.05, 0.15]});
return f;

// interactive opacity
return Interactive({
  x: Slider(50, {max: 100, title: 'Opacity'}),
  y: Slider(50, {max: 100, title: 'Width'})
}, ({x, y}) => {
  let [a, w] = [x / 100, y / 100];
  let r = Rect({pos: [0.5*w, 0.5*w], rad: [0.5*w, 0.5*w], fill: 'red', opacity: a});
  let f = Frame(r, {margin: 0.1});
  return f;
});

// tex plot
let a = 0.027;
let s1 = SymPath({fy: t => t, xlim: [-2, 2]});
let s2 = SymPath({fy: t => -t, xlim: [-2, 2]});
let s3 = SymPath({fx: t => 0, ylim: [-2, 0], stroke_dasharray: 3, stroke: 'blue'});
let s4 = SymPath({fy: t => 0, xlim: [-2, 0], stroke_dasharray: 3, stroke: 'red'});
let sc = Points([
  [0, 0], [2, 2], [-2, -2], [2, -2], [-2, 2], [0, -2], [-2, 0]
]);
let p = Plot([s1, s2, s3, s4, sc], {
  xlim: [-2.5, 2.5], ylim: [-2.5, 2.5],
  xticks: [-2, -1, [0, Tex('\\alpha')], 1, 2],
  yticks: [-2, -1, [0, Tex('\\beta')], 1, 2],
  ticksize: 0.04
});
let f = Frame(p, {padding: [0.15, 0.05, 0.05, 0.15]});
return f;

// multi plot
let s = [0.5, 0.7, 1.0, 1.4].map(a => SymPath({fy: x => sin(a*x), xlim: [-1, 1]}));
let t = Points([[0, 0.5], [0.5, 0], [-0.5, 0], [0, -0.5]], {size: 0.015});
let r = Points([[Rect(), [0.5, 0.5]], [Circle(), [-0.5, -0.5]]], {size: 0.1});
let p = Plot([...s, r, t], {
  xlim: [-1, 1], ylim: [-1, 1], ygrid: true, xgrid: true,
  xlabel: 'time (seconds)', ylabel: 'space (meters)', title: 'Spacetime Vibes'
});
return Frame(p, {margin: 0.3});

// complex points
let r0 = Rect({stroke: 'red', opacity: 0.5});
let ex = Group([Ray(45), Ray(-45)]);
let hi = Text('hello', {font_family: 'Montserrat', font_weight: 300});
let exhi = HStack([Frame(ex, {margin: 0.3}), hi]);
let s0 = Points([
  [-0.3, 0.3], [0.4, 0.6], [-0.5, 0.8]
], {
  shape: exhi, size: 0.1
});
let p = Plot(s0, {xlim: [-1, 1], ylim: [0, 1]});
let f = Frame(p, {margin: 0.13});
return f;

// simple bars
let b = BarPlot([['A', 5], ['B', 8], ['C', 10], ['D', 6], ['E', 3]]);
return Frame(b, {margin: [0.15, 0.1]});

// multibars
let vb = Bar('v', [[3, 'yellow'], [5, 'lightblue'], [2, 'lightgreen']]);
let b = BarPlot([['A', 5], ['B', vb], ['C', 6]]);
return Frame(b, {margin: [0.15, 0.1]});

// legend example
let args2 = {stroke: 'red', stroke_dasharray: [4, 4], stroke_width: 2};
let info = [['blue', 'Hello World'], [args2, 'Testing Longer String']];
let leg = Legend(info, {pos: [1.4, 1.8], rad: 0.25, vspacing: 0.3});
let line1 = SymPath({fy: x => 1.5*x*(2-x), xlim: [0, 2], stroke: 'blue'});
let line2 = SymPath({fy: x => x*(2-x), xlim: [0, 2], ...args2});
let plot = Plot([line1, line2, leg], {ylim: [0, 2]});
let frame = Frame(plot, {margin: 0.15});
return frame;

// the economist style
let n = 41;
let c = 'rgb(30,92,153)';
let vals = range(n).map(x => 50*random(x));
let bars = VBars(vals, {
  integer: true, bar_fill: c, bar_stroke: c
});
let labs = Points([0, 25, 50, 75].map(
  x => [Anchor(Text(x)), [n+3, x+4]]
), {size: 1});
let plot = Plot([bars, labs], {
  aspect: phi, xlim: [-1, n+4], ylim: [0, 80], xticks: range(0, n+10, 10), yticks: 4,
  xaxis_tick_pos: 'down', yaxis: false, ygrid: linspace(0, 100, 5)
});
let frame = Frame(plot, {margin: 0.15});
return frame;

// Expected utility indifference curves

return Interactive({
  a: Slider(50, {min:10, max: 100, title: 'a: y = ax + (1-a)z'})
}, ({a}) => {
  a = a / 100;
  let slope = (1-a)/a;
  let nlines = round(10/a)+1;
  let offs = linspace(1, 1-1/a, nlines);

  let s1 = SymPath({fy: t => 1-t, xlim: [0, 1]});
  let s2 = SymPath({fy: t => slope*t, xlim: [0, a], stroke: 'red', stroke_width: 3});
  let icurves = offs.map(x => SymPath({
    fy: t => (slope*t) + x, xlim: [max(0,-x/slope), (1-x)*a], stroke_dasharray: 3
  }));

  let scl = Note(`${a}x + (1-${a})z`, {pos: [a+0.14, 1-a+.03], rad: 0.12, stroke: 'red', fill: 'red'});
  let sc = Dot({pos: [a, 1-a], rad: 0.012});

  let p = Plot([s1, s2, sc, scl, ...icurves], {
    xlim: [0, 1], ylim: [0, 1], ticksize: 0.03
  });

  return Frame(p, {padding: 0.15});
});

// zoink factor
return Interactive({
  z: Slider(0, {min: 0, max: 1, step: 0.01, title:' Zoink Factor'}),
  c: Toggle(true, {title: 'Align Line'})
}, ({ z, c }) => {
  let rads = (2*pi)*z;
  let perp = c ? 90 : 0;
  let angl = Math.atan(cos(-rads));
  let path = SymPath({fy: sin, xlim: [0, 2*pi]});
  let pill = VStack([Rect({fill: blue, aspect: 1}), Rect({fill: red, aspect: 1})]);
  let box = Place(pill, {pos: [rads, sin(rads)], rad: 0.3, rotate: perp-r2d*angl, invar: true});
  let plot = Graph([path, box], {xlim: [0, 2*pi], ylim: [-1, 1]});
  let frame = Frame(plot, {margin: [0.2, 0.25]});
  return frame;
});

// smooth transition
return Interactive({
  x: Slider(50, {min: 0, max: 100, title: 'Transition'})
}, ({x}) => {
  let f = 0.5*(1-cos(x/100*pi));
  let a = Text('A', {opacity: 1-f});
  let b = Text('B', {opacity: f});
  let g = Group([a, b], {aspect: 1});
  let r = Frame(g, {margin: 0.1, border: 1});
  return r;
});

// check mark
return Interactive({
    check: Toggle(true, {title: 'Toggle checked/unchecked'}),
    margin: Slider(50, {min: 0, max: 100, title: 'Frame margin'})
}, ({check, margin}) => {
  let letter = check ? '🐋' : '🗻';
  let a = Node(letter);
  let n1 = VStack([a, a]);
  let n2 = HStack([n1, a]);
  return Frame(n2, {margin: margin/100});
});

// colors
return Interactive({
    x: Slider(50, {min: 0, max: 100, title: 'margin'})
}, ({x}) => {
  let [s, l] = interpolateVectors([0, 100], [100, 0], x/100);
  return Rect({stroke:'none', fill:`hsl(180, ${s}%, ${l}%)`});
});

// custom axes
let ax = XAxis([[1, 'lo'], [2.1, 'hi']], {lim: [0, 3.2], aspect: 3});
let out = Frame(ax, {margin: [0, 0, 0, 0.5]});
let f = Frame(out, {margin: 0.2});
return f;

let ax = YAxis([[1, 'lo'], [2.1, 'hi']], {lim: [0, 3.2], aspect: 0.3});
let out = Frame(ax, {margin: [0.5, 0, 0, 0]});
let f = Frame(out, {margin: 0.2});
return f;

let ax = Axes({
    xticks: [[1, 'lo'], [2.1, 'hi']],
    yticks: [[1, 'lo'], [2.1, 'hi']],
    xlim: [0, 3], ylim: [0, 3]
})
let f = Frame(ax, {margin: 0.2});
return f;

// vector field
let grid0 = linspace(-1, 1, 11);
let grid = Array.prototype.concat(...grid0.map(x => grid0.map(y => [x, y])));
let fshape = ([x, y]) => Group([
  Circle({cx: 0.5+x, cy: 0.5-y, r: 0.1, fill: 'black'}),
  Line({x1: 0.5, y1: 0.5, x2: 0.5+x, y2: 0.5-y})
]);
let field = Points(
  grid.map(p => [fshape(p), p]),
  {size: 0.04}
);
let p = Plot(field, {
  xlim: [-1.2, 1.2], ylim: [-1.2, 1.2],
  xticks: linspace(-1, 1, 5), yticks: linspace(-1, 1, 5)
});
let f = Frame(p, {margin: 0.13});
return f;

// custom axis anchors
let ln = SymPath({fy: sin, xlim: [0, 2*pi]});
let ax = Plot(ln, {
  xticks: range(1, 7), yticks: range(-1, 2),
  xlim: [0, 2*pi], xanchor: 0, aspect: 1.5
})
let f = Frame(ax, {margin: 0.1});
return f;

// fancy plot
let xlim = [0, 2*pi], ylim = [-1, 1];
let func = x => -sin(x);
let pal = x => interpolate_hex('#1e88e5', '#ff0d57', x);
let xticks = linspace(0, 2, 6).slice(1).map(x => [x*pi, `${rounder(x, 1)} π`]);
let line = SymPath({fy: func, xlim});
let points = SymPoints({
  fy: func, xlim, N: 21, size: 0.04,
  fs: (x, y) => Circle({fill: pal((1+y)/2), r: (1+abs(y))/2})
});
let plot = Plot([line, points], {
  xlim, ylim, xanchor: 0, aspect: 1.5, xaxis_tick_pos: 'both',
  xticks, yticks: 5, xgrid: true, ygrid: true, xlabel_offset: 0.1,
  xlabel: 'phase', ylabel: 'amplitude', title: 'Inverted Sine Wave',
  xgrid_stroke_dasharray: 3, ygrid_stroke_dasharray: 3
});
return Frame(plot, {margin: 0.25});

// rounded bar plot
let topr = a => RoundedRect({round: [0.05, 0.05, 0, 0], ...a});
let abar = VBar(23.2, {color: '#e855ac', shape: topr});
let bbar = VBar(17.3, {color: '#009f9c', shape: topr});
let cbar = VBar(25.8, {color: '#0582fc', shape: topr});
let bars = BarPlot([
  ['Whisper', abar], ['Whisper V2', bbar], ['SeamlessM4T', cbar]
], {
  ylim: [0, 30], yticks: 6, title: Text('S2ST', {font_weight: 400}),
  xlabel: 'BLEU', ygrid: true, yticks: [0, 10, 20, 30],
  xaxis_tick_stroke_width: 0, yaxis_tick_stroke_width: 0,
  xaxis_line_stroke_width: 1.5, yaxis_line_stroke_width: 0,
});
return Frame(bars, {margin: 0.3});

// bezier paths
let p0 = [0.2, 0.8];
let p1 = [0.8, 0.2];
let px = [0.3, 0.3];
let path = Path([MoveTo(p0), Bezier2(p1, px)]);
let dots = Points([p0, p1, [Circle({fill: 'white'}), px]], {size: 0.01});
let line1 = Line({p1: p0, p2: px, stroke_dasharray: [5, 5]});
let line2 = Line({p1: p1, p2: px, stroke_dasharray: [5, 5]});
let plot = Plot([path, line1, line2, dots], {
  xlim: [0, 1], ylim: [0, 1], xticks: 6, yticks: 6
});
let frame = Frame(plot, {margin: 0.15});
return frame;

// networks
return Network([
  [['A', ['hello', 'world']], [0.15, 0.5]],
  [['B', 'hello'], [0.85, 0.2]],
  [['C', 'world'], [0.7, 0.8]]
], [
  ['A', 'B'], ['A', 'C']
], {
  size: 0.1, aspect: phi
});

// normalized hypotrochoid thingy
let [b, h] = [0.13, 0.5];
let poly = SymPath({
  fx: t => (1-b)*cos(t) + h*cos((1-b)/b*t),
  fy: t => (1-b)*sin(t) - h*sin((1-b)/b*t),
  tlim: [0, 30*pi], N: 5000
});
return Graph(poly, {xlim: [-1.5, 1.5], ylim: [-1.5, 1.5]});

// shaded density plot
xlim = [0, 4]; ylim = [0, 1];
func = x => 1/(max(0.01,x)*sqrt(pi/2))*exp(-2*pow(log(x), 2));
fill = Group([
  SymFill({fy1: func, fy2: 0, xlim, fill: '#00BBFF', stroke_width: 0}),
  SymPath({fy: func, xlim, stroke_width: 1.5, N: 200})
], {opacity: 0.8});
plot = Plot(fill, {
  aspect: 1.5, xlim, ylim, xticks: 5, yticks: 3, xgrid: true, ygrid: true
});
frame = Frame(plot, {margin: 0.1});
return frame;

// stacked density plots
func = x => 0.9*exp(-6*pow(log(max(0, x)), 2));
base_func = b => (x => b + func(x/pow(b+1, 0.3)));
xlim = [-0.3, 4.3]; ylim = [-0.2, 3.8];
fill_func = b => Group([
  SymFill({fy1: base_func(b), fy2: x => b, xlim: [0, 4], fill: '#00BBFF', stroke_width: 0}),
  SymPath({fy: base_func(b), xlim: [0, 4], stroke_width: 1.5, opacity: 0.8}),
  HLine(b, {lim: [0, 4], opacity: 0.5})
]);
offsets = linspace(0, 3, 5);
kdes = Group(offsets.map(fill_func).reverse());
let lines = Group([HLine(ylim[1], {lim: xlim}), VLine(xlim[1], {lim: ylim})]);
let plot = Plot([lines, kdes], {
  aspect: 0.7, xticks: linspace(0, 4, 5), xlim: xlim, ylim, xgrid: true, ygrid: true,
  yticks: zip(offsets, ['A', 'B', 'C', 'D', 'E'])
});
return Frame(plot, {margin: 0.1});

// container args  demo
let crect = c => Rect({aspect: 1.5, stroke: c});
let rect = rad_rect([0.5, 0.5], 0.25);
let [rotate, align] = [15, 'center'];
let cont = Container([
  [crect('black'), {rect}],
  [crect('black'), {rect, expand: true}],
  [crect('red'), {rect, rotate, align}],
  [crect('green'), {rect, rotate, align, invar: true}],
  [crect('blue'), {rect, rotate, align, expand: true}],
  [crect('orange'), {rect, rotate, align, expand: true, invar: true}],
], {clip: false});
return cont;

// split axis example
let locs = range(50).map(i => random_gaussian(0, 1.5));
let dots = Points(locs, {size: 0.1, opacity: 0.25});
let hline = HLine(0, {lim: [-4, 4], stroke_dasharray: 4, opacity: 0.5});
let vline = VLine(0, {lim: [-4, 4], stroke_dasharray: 4, opacity: 0.5});
let plot = Plot([hline, vline, dots], {
  xlim: [-5, 4], ylim: [-5, 4], xaxis_lim: [-4, 4], yaxis_lim: [-4, 4]
});
let frame = Frame(plot, {margin: 0.15});
return frame;

// arrowhead alignment test
let vline = VLine(0.5);
let hline = HLine(0.5);
let farrow = d => Arrowhead({
  direc: d, size: 0.3, fill: 'none', stroke_width: 10, opacity: 0.5
});
let arrows = [0, 90, 180, 270].map(farrow);
let group = Group([vline, hline, ...arrows]);
return group;

// table (make this real at some point)
let data = [
    ['ID', 'Name', 'Code'],
    ['B', 'batch size', 'batch_size'],
    ['L', 'sequence length', 'block_size'],
    ['V', 'vocabulary size', 'vocab_size'],
    ['E', 'embedding size', 'n_embd']
];
let [ls, ns, cs] = zip(...data);
ls = ls.map(x => Text(x, {font_weight: 'bold'}));
ns = ns.map(x => Text(x));
cs = cs.map(x => Text(x, {font_family: 'monospace', stroke: '#1e88e5', fill: '#1e88e5'}));
let make_col = c => VStack(c, {expand: false, align: 'left', spacing: 0.1});
let table = HStack([ls, ns, cs].map(make_col), {spacing: 0.1});
return table;

// interactive vector field
return Interactive({
  a: Slider(50, {min: 1, max: 100, title: 'x-dispersion'}),
  b: Slider(50, {min: 1, max: 100, title: 'y-dispersion'}),
}, ({a, b}) => {
  [a, b] = [a / 50, b / 50];
  let grid0 = linspace(-1, 1, 15);
  let grid = Array.prototype.concat(...grid0.map(x => grid0.map(y => [x, y])));
  let fshape = ([x, y]) => {
    let z = interpolateVectors([70, 50, 50], [140, 50, 50], (x*a/2));
    let c = `hsl(${z[0]}, ${z[1]}%, ${z[2]}%)`;
    let o = ((a*x)**2 + (b*y)**2)**(1.5);
    return  Group([
      Circle({pos: [0.5+(a*x), 0.5-(b*y)], rad: 0.1, stroke: c, fill: c, opacity: o}),
      Line([0.5, 0.5], [0.5+(a*x), 0.5-(b*y)], {stroke_width: 2, stroke: c, opacity: o})
    ]);
  };
  let field = Points(grid.map(p => [fshape(p), p]), {size: 0.04});
  let p = Plot(field, {
    xlim: [-1.2, 1.2], ylim: [-1.2, 1.2],
    xticks: linspace(-1, 1, 5), yticks: linspace(-1, 1, 5)
  });
  let f = Frame(p, {margin: 0.13});
  return f;
});

// bar plot
return Interactive({
  b: Slider(10, {min: 0, max: 20, title: 'b'})
}, ({b}) => {
  let bars = BarPlot({'a': 2, 'b': b, 'c':20, 'd': 13});
  return Frame(bars, {padding: 0.15});
});

// stacked bar
return Interactive({
    x: Slider(10, {min: 0, max: 20, title: 'b'})
}, ({x}) => {
    d = {'a': {stacked: [[x/4], [2, 'blue'],[2, 'purple']]}, 'b': 8, 'c': 4}
    b = BarPlot(d, {color_by:[[17, 100, 45],[78,  80, 45]]})
    return Frame(b, {padding: [0.15, 0.05, 0.05, 0.15]});
});

// travelling rectangle animation
return Animation(
  {
    x: Continuous([0, 1])
  },
  ({x}) => {
    let r = Place(Rect(), {pos: [x, x], rad: 0.1});
    return Frame(r, {margin: 0.15});
  }
);

// two part animation
return Animation({
  w: Continuous([0, 0.5], {tlim: [0, 1]}),
  o: Continuous([0.1, 1], {tlim: [1, 2]}),
}, ({w, o}) => {
  let rect = Rect({pos: [0.5*w, 0.5*w], rad: [0.5*w, 0.5*w], fill: red, opacity: o});
  return Frame(rect, {margin: 0.1});
}, {
  tlim: [0, 2]
});

// goofy ass sine animation
let xlim = [0, 2*pi];
return Animation(
  {
    t: Continuous([0, 4*pi])
  },
  ({t}) => {
    let p = (t < 2*pi) ? t : 4*pi-t;
    let fy = x => sin(t)*sin(x);
    let path = SymPath({fy, xlim});
    let scat = Points([[p, fy(p)]], {size: 0.1, shape: Dot({fill: red})});
    let plot = Graph([path, scat], {xlim, ylim: [-1, 1]});
    return Frame(plot, {margin: 0.15});
  },
  {tlim: [0, 4], loop: true, fps: 60}
);

// moon loop
return Animation(
  {m: Discrete(['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'])},
  ({m}) => Frame(Text(m), {padding: 0.2, border_fill: '#555'}),
  {tlim: [0, 2], loop: true}
);
