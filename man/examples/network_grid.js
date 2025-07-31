// Three rows of nodes connected by lines. The first row has three nodes for product categories 1, 2, and 3. The second row has three nodes for Wikipedia text 1, 2, and 3. And the third row has five notes for patent abstract 1 through 5. The first two rows are connected by bi-directional filled in arrows. The second and third rows are partially connected by curved lines.
let conns = [[1, 1], [1, 2], [3, 3], [2, 4], [3, 5]];
return Network([
  ...range(1, 4).map(i => [`pc${i}`, ['Product'  , `Category ${i}`], [i+1, 1], 0.4]),
  ...range(1, 4).map(i => [`wt${i}`, ['Wikipedia', `Text ${i}`    ], [i+1, 3], 0.4]),
  ...range(1, 6).map(i => [`pa${i}`, ['Patent'   , `Abstract ${i}`], [i  , 5], 0.4]),
], [
  ...range(1, 4).map(i => [`pc${i}`, `wt${i}`, {arrow: true}]),
  ...conns.map(([i1, i2]) => [[`wt${i1}`, 'south'], [`pa${i2}`, 'north']])
], {
  aspect: phi, coord: [0, 0, 6, 6], node_border_rounded: 0.05, edge_arrow_size: 0.1
});
