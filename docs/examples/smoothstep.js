// define the generalized smoothstep function and plot it for k = 1, 2, 3, 4, 5
let eqn1 = Latex('\\ell_k(x) = x^k / \\left[{x^k+(1-x)^k}\\right]');
let eqn2 = Latex('s_k(x) = 3 \\ell_k(x)^2 - 2 \\ell_k(x)^3');
let eqn = VStack([eqn1, eqn2], {expand: false, spacing: 0.2});

let xlim = [0, 1]; let ylim = [0, 1]; let n = 5;
let smov = (x, k) => {
    let t = pow(x, k)/(pow(x, k) + pow(1-x, k));
    return 3*pow(t, 2) - 2*pow(t, 3);
}
let pall = i => interpolate_hex(red, blue, i/(n-1));
let paths = range(1, n+1).map((k, i) =>
    SymPath({fy: x => smov(x, k), xlim, stroke: pall(i), stroke_width: 1.2})
);
let hline = HLine(1, {lim: xlim});
let vline = VLine(1, {lim: ylim});

let badger = c => HLine(0.5, {stroke: c, stroke_width: 2, aspect: 1})
let legend = Legend(range(1, n+1).map(
    i => [badger(pall(i-1)), Latex(`k = ${i}`)]),
    {pos: [0.87, 0.33], rad: 0.09, hspacing: 0.1, vspacing: 0.15});

let plot = Plot([...paths, legend, hline, vline], {
    aspect: phi, ylim, grid: true, grid_stroke_dasharray: 3,
});

let eframe = Frame(eqn, {margin: 0.13});
let pframe = Frame(plot, {
    margin: [0.15, 0.05, 0.15, 0.1], border_fill: '#f6f6f6'
});
let stack = VStack([eframe, pframe]);
return TitleFrame(stack, 'Smoothstep — k', {
    padding: 0.05, margin: 0.1, title_size: 0.05, title_fill: '#f6f6f6'
});
