# Group

[Element](/docs/element)

This is the **Element** class by which components are grouped together. It accepts a list of Elements and attempts to place them according to their declared properties. There are a few child properties that a group container will look for:

- `pos` — the desired position of the center of the child's rectangle
- `rad` ­— the desired radius of the child's rectangle (can be single number or pair)
- `rect` — a fully specified rectangle to place the child in (this will override `pos`/`rad`)
- `aspect` — the aspect ratio of the child's rectangle
- `expand` — when `true`, instead of embedding the child within `rect`, it will make the child just large enough to fully contain `rect`
- `align` — how to align the child when it doesn't fit exactly within `rect`, options are `left`, `right`, `center`, or a fractional position (can set vertical and horizontal separately with a pair)
- `rotate` — how much to rotate the child by (degrees counterclockwise)
- `invar` — whether to ignore rotation when sizing child element

Placement positions are specified in the group's internal coordinate space, which defaults to the unit square. The child's `aspect` is an important determinant of its placement. When it has a `null` aspect, it will fit exactly in the given `rect`. However, when it does have an aspect, it needs to be adjusted in the case that the given `rect` does not have the same aspect. The `expand` and `align` specification arguments govern how this adjustment is made.

Parameters:
- `aspect` = `null` — the aspect ratio of the group's rectangle (can pass `'auto'` to infer from the children)
- `coord` = `[0, 0, 1, 1]` — the internal coordinate space to use for child elements
