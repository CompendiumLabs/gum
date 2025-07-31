// create a square context of radius 50 centered at 100 and map [0.3, 0.5] to pixel coordinates
const prect = [ 50, 50, 150, 150 ]
const ctx = new Context({ prect })
const [fx, fy] = [0.3, 0.5]
const [px, py] = ctx.mapPoint([fx, fy])
return `[${fx}, ${fy}] → [${px}, ${py}]`
