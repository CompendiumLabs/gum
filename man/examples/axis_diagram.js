// A horizontal axis with ticks at "q/\gamma", "Bq/\gamma", "q", "Bq", and "\gamma^{\prime}q$ labeled at the bottom. On the top, "q/\gamma" is labeled with "Prev", "q" is labeled with "Current", and "\gamma^{\prime}q" is labeled with "Next". There is a semi-transparent box ranging from "Bq/\gamma" to "Bq" labeled with "Lagging" on the top left, "Leading" on the top right, and "Patent Coverage" across the bottom.

// ticks (top and bottom)
let ticks = [
  [0.1, Latex('q/\\gamma')], [0.3, Latex('B q/\\gamma')], [0.5, Latex('q')],
  [0.7, Latex('B q')], [0.9, Latex('\\gamma^{\\prime} q')]
];
let main = HAxis(ticks, {tick_pos: 'both', label_pos: 'top', tick_size: 0.07});
let tops = [[0.1, 'Prev'], [0.3, ''], [0.5, 'Current'], [0.7, ''], [0.9, 'Next']];
let top = HAxis(tops, {line_stroke: 0, tick_size: 0.05});

// shaded box with albels
let vline = VLine(0.5, {opacity: 0.25, stroke_dasharray: 4});
let shade = Rect({rad: [0.2, 0.5], stroke: 'black', fill: '#BBB', opacity: 0.15});
let lag = Place(Text('Lagging', {stroke: '#444'}), {pos: [0.4, 0.15], rad: 0.08});
let led = Place(Text('Leading', {stroke: '#444'}), {pos: [0.6, 0.15], rad: 0.08});
let pat = Place(Text('Patent Coverage', {stroke: '#444'}), {pos: [0.5, 0.9], rad: 0.18});

// group and frame
let group = Group([vline, shade, main, top, lag, led, pat], {aspect: 3});
return Frame(group, {margin: 0.05});
