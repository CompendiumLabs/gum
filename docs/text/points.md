# Points

<span class="inherit">[Container](#Container) > [Element](#Element)</span>

Place copies of a common shape at various points. The radius can be specified by the `size` keyword and overridden for particular children.

Positional arguments:
- `points` — a list of `[child, position]` pairs, where `position` can be either an `[x,y]` pair or a `[x,y,r]`/`[x,y,rx,ry]` list to override the default `size`

Keyword arguments:
- `size` = `0.01` — the default radius to use for children
- `shape` = `Dot()` — the default shape to use for children
- `stroke` = `black` — the color of the stroke
- `fill` = `black` — the color of the fill
- `stroke_width` = `1` — the width of the stroke
