# Container

<span class="inherit">[Element](#Element)</span>

This is the `Element` class by which components are grouped together. It accepts a list of `Element`s and their positions and attempts to place them accordingly, taking `Context` information an input and passing re-scoped `Context` information to sub-`Element`s.

The position of an element is specified by a placement specification (`spec`), which in the simplest case is a rectangle of the form `[x1, y1, x2, y2]`. However, other placement strategies can be specified with an `Object` using the arguments:
- `pos`/`rad` = `[0.5, 0.5]` — a position and radius specifying rectangle placement
- `rect` = `null` — a fully specified rectangle to place the child in (this will override `pos`/`rad`)
- `expand` = `false` — when `true`, instead of embedding the child within `rect`, it will make the child just large enough to fully contain `rect`
- `align` = `center` — how to align the child when it doesn't fit exactly within `rect`, options are `left`, `right`, `center`, or a fractional position (can set vertical and horizontal separately with a pair)
- `rotate` = `0` — how much to rotate the child by (degrees counterclockwise)
- `pivot` = `center` — the point around which to do the rotation (can set vertical and horizontal separately with a pair)
- `invar` = `true` — whether to ignore rotation when sizing child element

Placement positions are specified in the continer's internal coordinate space, which defaults to the unit square. The child's `aspect` is an important determinant of its placement. When it has a `null` aspect, it will fit exactly in the given `rect`. However, when it does have an aspect, it needs to be adjusted in the case that the given `rect` does not have the same aspect. The `expand` and `align` specification arguments govern how this adjustment is made.

Positional arguments:
- `children` — a list of `[child, spec]` pairs or `Element`s (or a single one). The `spec` can either be a rectangle or a dictionary specification as detailed above. If `spec` is omitted it defaults to `[0, 0, 1, 1]`.

Keyword arguments:
- `tag` = `'g'` — the SVG tag to use for this element
- `clip` = `true` — whether to infer the `aspect` of this element from the aspect ratio of the minimal bounding box of its children
- `coord` = `[0, 0, 1, 1]` — the internal coordinate space to use for child elements
