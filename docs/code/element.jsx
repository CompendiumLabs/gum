// create a custom triangle element called `Tri` and use it to create a triangle with a gray fill
class Tri extends Element {
  constructor({ children, pos0, pos1, pos2, ...attr }) {
    super({ tag: 'polygon', unary: true, ...attr })
    this.coords = [pos0, pos1, pos2]
  }
  props(ctx) {
    const pixels = this.coords.map(c => ctx.mapPoint(c))
    const points = pixels.map(([x, y]) => `${x},${y}`).join(' ')
    return { points, ...this.attr }
  }
}

return <Tri pos0={[0.5, 0.1]} pos1={[0.9, 0.9]} pos2={[0.1, 0.9]} fill="#eee" />
