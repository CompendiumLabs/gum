// Plot of three lines, one in red which is max(0,x), another in blue which is the same but with a slight dip at 0, and a final dashed horizontal line at 0. There is a legend labeling these lines as "ReLU" for the red line and "GELU" for the blue line. The x-axis ranges from -4 to 3, making sure there is a tick at 0.
let xlim = [-4, 3]; let ylim = [-1, 3];
let rargs = {stroke: red, stroke_width: 2};
let bargs = {stroke: blue, stroke_width: 2};
let relu = SymPath({fy: x => max(0, x), xlim, ...rargs});
let gelu = SymPath({fy: x => x*sigmoid(x), xlim, ...bargs});
let zero = HLine(0, {lim: xlim, stroke_dasharray: 4});
let leg = Legend([[rargs, 'ReLU'], [bargs, 'GELU']], {
    pos: [-2, 2], rad: 0.55, hspacing: 0.1, vspacing: 0.2
});
let plot = Plot([zero, relu, gelu, leg], {aspect: phi, ylim, xticks: 8});
return Frame(plot, {margin: 0.2});
