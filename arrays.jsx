// a scatter plot of points with emojis for: mount fuji, a rocket, a whale, a watermellon, and a donut

const emoji = [
  '🗻', '🚀', '🐋', '🍉', '🍩'
];
const icons = emoji.map(
  (e, i) => [new Text(e), [i+1, i+1]]
);
const points = new Points(icons, {
  size: 0.4,
});
const plot = new Plot(points, {
  xlim: [0, 6],
  ylim: [0, 6],
});
return new Frame(plot, {
  margin: 0.15,
});
