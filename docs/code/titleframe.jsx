// Various food emojis are arrnaged in a spaced out grid and framed with the title "Fruits & Veggies". Each emoji is framed by a rounded square with a gray background.

const emojis = [
  '🍇', '🥦', '🍔', '🍉', '🍍', '🌽', '🍩', '🥝', '🍟'
];
const nodes = emojis.map(e => new TextFrame(e, {
  border_rounded: 0.075,
  fill: '#e6e6e6',
  aspect: 1,
}));
const grid = new Grid(split(nodes, 3), {
  spacing: 0.05,
});
return new TitleFrame(grid, 'Fruits & Veggies', {
  margin: 0.1,
  padding: 0.1,
  rounded: 0.05,
  title_size: 0.065,
});
