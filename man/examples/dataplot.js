/* test.csv
cgdppc_bin,pop_growth
D1,1.985835391831649
D2,2.061587797338341
D3,2.041200143659709
D4,2.2775697251850473
D5,2.1672285631213555
D6,1.6890253989475303
D7,1.6252890931109332
D8,1.3766574480218001
D9,1.1919663726530039
D10,1.0828717612939973
*/

let { cgdppc_bin, pop_growth } = getData('plot.csv', true);
let line = Polyline(pop_growth, {stroke_width: 2});
let points = Points(pop_growth, {size: 0.1, fill: blue});

let plot = Plot([line, points], {
  aspect: 2, grid: true, fill: 'white',
  xlim: [-1, 10], ylim: [0.5, 3.0],
  yticks: 6, xticks: cgdppc_bin,
  xlabel: 'GDP/pop Decile',
  ylabel: 'Population Growth (%)'
});

return TitleFrame(plot, 'Demographic Function', {
  margin: [0.25, 0.1, 0.1, 0.25]
});
