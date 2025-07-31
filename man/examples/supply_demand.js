// Plot a linear supply and demand curves. Mark their intersection with a filled in white point and gray lines. Make the supply line red and the demand line blue, and shade the consumer surplus in light blue. Shade the overall graph in light gray and include dashed grid lines.
// Make some constants
let xlim = [0, 1]; let ylim = [0, 1];
let fsupply = x => 0.1 + 0.8*x;
let fdemand = x => 0.9 - 0.8*x;
let [qs, ps] = [0.5, 0.5];

// Create the supply and demand lines
let supply = SymPath({ fy: fsupply, xlim, stroke: red, stroke_width: 2, });
let demand = SymPath({ fy: fdemand, xlim, stroke: blue, stroke_width: 2, });

// Create consumer surplus (area between demand curve and equilibrium price)
let surplus = SymFill({ fy1: fdemand, fy2: ps, xlim: [0, qs], fill: blue, opacity: 0.2 });

// Add intersection point marker
let marker = Place(Circle({fill: 'white'}), { pos: [qs, ps], rad: 0.013 });

// Add labels for the lines
let supply_label = Note('Supply', { pos: [0.8, 0.8 ], rad: 0.07 , rotate: -40 });
let demand_label = Note('Demand', { pos: [0.8, 0.31], rad: 0.085, rotate:  40 });
let surplus_label = Note('Consumer Surplus', { pos: [0.2, 0.55], rad: 0.15 });

let qline = VLine(qs, { lim: ylim, stroke: '#aaa' });
let pline = HLine(ps, { lim: xlim, stroke: '#aaa' });

// Create the plot with all elements
let plot = Plot([
    qline, pline, surplus, supply, demand, marker, supply_label, demand_label, surplus_label,
], {
    aspect: 1, xlim, ylim, xlabel: 'Quantity', ylabel: 'Price',
    xticks: 5, yticks: 5, grid: true, grid_opacity: 0.2, grid_stroke_dasharray: 3,
    label_offset: 0.13,
});

// Frame the plot with appropriate margins
return TitleFrame(plot, 'Supply & Demand', {
    margin: 0.25, title_size: 0.05, border_fill: '#f6f6f6'
});
