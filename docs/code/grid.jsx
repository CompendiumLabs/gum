// draw a grid of square boxes filled in light gray. each box contains an arrow that is pointing in a particular direction. that direction rotates clockwise as we move through the grid.
const head = new Arrow(90, {
    pos: [0.5, 0],
    head: 0.3,
    tail: 1,
});
const arrows = linspace(0, 360, 10).slice(0, 9).map(
    th => new Rotate(head, th)
);
const boxes = arrows.map(a => new Frame(a, {
    aspect: 1,
    border: 1,
    rounded: 0.1,
    padding: 0.2,
    fill: '#EEE',
}));
const grid = new Grid(reshape(boxes, [3, 3]), {
    spacing: 0.1,
});
return new Frame(grid, {
    padding: 0.1,
});
