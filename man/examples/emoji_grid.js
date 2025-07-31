// Four by three grid of boxes, each with a different emoji in it. The emojis are a random selection of fruits and candies.
let emoji = [
  '🍩🍦🍨🍫🍌',
  '🍕🍉🍒🍇🍐',
  '🥝🍎🍓🍬🍪',
];
let nodes = emoji.map(row => [...row].map(s => TextFrame(s, {flex: true})));
let aspect = max(...nodes.map(r => r.length))/nodes.length;
let grid = Grid(nodes, {aspect});
return Frame(grid, {margin: 0.1});
