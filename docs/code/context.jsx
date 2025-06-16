// create a square context of radius 50 centered at 100 and map [0.3, 0.5] to pixel coordinates

const ctx = new Context([50, 50, 150, 150]);
const [fx, fy] = [0.3, 0.5];
const [px, py] = ctx.coord_to_pixel([fx, fy]);
return `[${fx}, ${fy}] → [${px}, ${py}]`;
