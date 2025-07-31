// A horizontal axis with 4 ticks. On the top side, the ticks are labeled "0", "i", "j", and "1". On the bottom side, the middle two ticks are labeled in Latex with "q\_{i,1}" and "q\_{i,2}".
let ticks1 = zip([0, 0.35, 0.7, 1], [Latex('0'), Latex('i'), Latex('j'), Latex('1')]);
let ticks2 = zip([0.35, 0.7], [Latex('q_{i,1}'), Latex('q_{j,2}')]);
let axis1 = HAxis(ticks1, {tick_size: 0.5, tick_pos: 'both'});
let axis2 = HAxis(ticks2, {tick_size: 0.5, label_pos: 'out', label_offset: 0});
return Frame(Group([axis1, axis2]), {aspect: 6, margin: [0.05, 2]});
