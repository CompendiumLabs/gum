// create a custom triangle element called `Tri` and use it to create a triangle with a gray fill

class Tri extends Element {
  constructor(p0, p1, p2, attr) {
    super('polygon', true, attr);
    this.coords = [p0, p1, p2];
  }
  props(ctx) {
    const pixels = this.coords.map(c => ctx.coord_to_pixel(c));
    const points = pixels.map(([x, y]) => `${x},${y}`).join(' ');
    return {points, ...this.attr};
  }
}

return new Tri(
  [0.5, 0.1], [0.9, 0.9], [0.1, 0.9], {fill: '#EEE'}
);
