// Various simple shapes spiraling inwards. The shapes have black borders and semi-transparent fills. They are tinted blue at the outside and red towards the inside. They are framed by a circle with a black border and a gray background.
let freq = 38*pi;
let shapes = [Circle, Square, Triangle];
let pal = t => interpolate_hex(red, blue, t/freq);
let fshape = i => shapes[i % shapes.length];
let rshape = (t, i) => Rotate(fshape(i)({fill: pal(t), opacity: 0.7}), t);
let spiral = SymPoints({
    fx: t => (t/freq) * cos(t),
    fy: t => (t/freq) * sin(t),
    fs: (x, y, t, i) => rshape(t, i),
    tlim: [0, freq],  N: 100, size: 0.06
});
let background = Circle({pos: [0, 0], rad: 1, fill: '#eee'});
let graph = Graph([background, spiral], {xlim: [-1, 1], ylim: [-1, 1]});
return Frame(graph, {margin: 0.1});