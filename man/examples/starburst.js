// A square grid of four cells, where each cell contains a starburst pattern with 12 lines radiating outwards from a central point.
let n = 12;
let shape = [2, 2];
let size = prod(shape);
let star = Group(range(-90, 90, 180/n).map(Ray));
let grid = Grid(reshape(repeat(star, size), shape));
return Frame(grid, {border: 1, margin: 0.05});
