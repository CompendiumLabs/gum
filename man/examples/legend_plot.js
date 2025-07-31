// A plot of two lines that are zero at 0 and 2 but are positive inbetween. One of the lines is solid blue while the other line is dashed red. The plot has a legend in the top right naming the blue line "Hello World" and the red line "Testing Longer String".
let args1 = {stroke: blue};
let args2 = {stroke: red, stroke_dasharray: 6};
let info = [[args1, 'Hello World'], [args2, 'Testing Longer String']];
let leg = Legend(info, {pos: [1.5, 1.8], rad: 0.45, vspacing: 0.3});
let line1 = SymPath({fy: x => 1.5*x*(2-x), xlim: [0, 2], ...args1});
let line2 = SymPath({fy: x => x*(2-x), xlim: [0, 2], ...args2});
let plot = Plot([line1, line2, leg], {aspect: phi, ylim: [0, 2]});
return Frame(plot, {margin: 0.2});
