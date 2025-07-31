// Plot of two lines that both originate at zero and intersect at a single point, one that is convext and one that is concave. The intersection point is labeled as k1* and k2*, both on the axes and with grid lines. The x-axis label is "Capital Stock 1 (k1)" and the y-axis label is "Capital Stock 2 (k2)".
let klim = [0.0, 1.5]; let [a, b] = [1.0, 0.5];
let kzero1 = k1 => a*k1**b; let kzero2 = k2 => a*k2**b;
let kstar = a**(1/(1-b));
let path1 = SymPath({fy: kzero1, xlim: klim});
let path2 = SymPath({fx: kzero2, ylim: klim});
let note1 = Note('\\dot{k}_1=0', {pos: [1.62, 1.24], rad: 0.09, latex: true});
let note2 = Note('\\dot{k}_2=0', {pos: [1.21, 1.6], rad: 0.09, latex: true});
let xlabel = HStack([Text('Capital Stock 1 '), Latex('(k_1)')]);
let ylabel = HStack([Text('Capital Stock 2 '), Latex('(k_2)')]);
let plot = Plot([path1, path2, note1, note2], {
  aspect: phi, xlim: klim, ylim: klim, xaxis_pos: 0, xaxis_tick_pos: 'both',
  xticks: [[kstar, Latex('k_1^{\\ast}')]], yticks: [[kstar, Latex('k_2^{\\ast}')]],
  xlabel, ylabel, grid: true, label_offset: 0.12
});
return Frame(plot, {margin: 0.25});
