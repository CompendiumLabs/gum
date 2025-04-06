// a horizontal axis with 5 ticks labeled with emojis for: mount fuji, a rocket, a whale, a watermellon, and a donut

const emoji = [
  '🗻', '🚀', '🐋', '🍉', '🍩'
];
const ticks = zip(
  linspace(0, 1, emoji.length), emoji
);
const axis = new Axis('h', ticks, {
  tick_size: 0.5,
  tick_pos: 'both',
});
return new Frame(axis, {
  aspect: 5,
  margin: [0.1, 1.3, 0.1, 0],
});
