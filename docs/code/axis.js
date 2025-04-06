// a horizontal axis with 5 ticks labeled with emojis for: mount fuji, a rocket, a whale, a watermellon, and a donut
let ticks = zip(linspace(0, 1, 5), ['🗻', '🚀', '🐋', '🍉', '🍩']);
let axis = Axis('h', ticks, {tick_size: 0.5, tick_pos: 'both'});
let frame = Frame(axis, {aspect: 5, margin: [0.1, 1.3, 0.1, 0]});
return frame;