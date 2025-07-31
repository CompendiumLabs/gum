// Plot of the path of a line that starts at a high level y0*, then at time t0 begins to decay exponentially down to a lower level y1*. The x-axis has a label for time t0, and the y-axis has labels for y0* and y1*. Each of these are also denoted with dashed lines in the plot. The x-axis label is "Time (t)" and the y-axis label is "Output (y)".
let [t0, ymax, yss0, yss1] = [0.2, 1.4, 1.0, 0.7];
let path0 = HLine(1, {x1: 0, x2: t0, stroke_width: 2});
let path1 = SymPath({
    fy: x => min(yss0, yss1 + (yss0-yss1)*exp(-6*(x-t0))),
    xlim: [0, 1], stroke_width: 2
});
let start = VLine(t0, {lim: [0, ymax], stroke_dasharray: [4, 4]});
let steady1 = HLine(1, {lim: [0, 1], stroke_dasharray: [4, 4]});
let steady2 = HLine(yss1, {lim: [0, 1], stroke_dasharray: [4, 4]});
let plot = Plot([path0, path1, start, steady1, steady2], {
    xlim: [0, 1], ylim: [0, ymax], aspect: phi,
    xlabel: 'Time (t)', ylabel: 'Output (y)',
    xticks: [[t0, Latex('t_0')]], label_offset: 0.1,
    yticks: [[yss1, Latex('y^{\\ast}_1')], [1, Latex('y^{\\ast}_0')]]
});
let frame = Frame(plot, {padding: 0.2});
return frame;
