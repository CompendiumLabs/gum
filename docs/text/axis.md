# Axis

<span class="inherit">[Container](#Container) > [Element](#Element)</span>

A single vertical or horizontal axis for plotting. This includes the central line, the perpendicual ticks and their associated tick labels. Note that the proper bounds encompass only the central line and ticks, while the tick labels may fall well outside of them.

Positional arguments:
- `direc` — the orientation of the axis, either `v` (vertical) or `h` (horizontal)
- `ticks` — a list of tick `[location, label]` pairs. The label can either be an `Element` or a `String`, in which case it is converted into a `Text` element

Keyword arguments:
- `label_size` = `1.5` — label size in the vertical dimensions relative to tick size
- `lim` = `[0, 1]` — the extent of the element along the main axis
- `tick_pos` = `'right'`/`'up'` — the extent of the ticks along the perpendicular axis. One of `'up'`, `'down'`, `'left'`, `'right'`, or `'both'`, or a pair representing a numerical range in `[0, 1]`, where zero is oriented up/right depending on the orientation

Subunit names:
- `line`: the central line along the main axis
- `tick`: the perpendicular tick marks (collectively)
- `label`: the labels annotating the tick marks (collectively)
