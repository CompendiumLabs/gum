# Points

*Inherits*: [Group](/docs/group) > [Element](/docs/element)

Place copies of a common shape at various points. The radius can be specified by the `size` keyword and overridden for particular children. The default shape is a black dot.

Keyword arguments:
- `locs` — a list of points, where each point is either an `[x,y]` pair or a `[pos, rad]` pair to override the default `size`
- `size` = `0.01` — the default radius to use for children
- `shape` = `Dot()` — the default shape to use for children
- `stroke` = `black` — the color of the stroke
- `fill` = `black` — the color of the fill
- `stroke-width` = `1` — the width of the stroke
