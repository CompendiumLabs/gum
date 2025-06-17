# Frame

[Group](/docs/group) > [Element](/docs/element)

This is a simple container class allowing you to add padding, margins, and a border to a single **Element**. It's pretty versatile and is often used to set up the outermost positioning of a figure. Mirroring the standard CSS definitions, padding is space inside the border and margin is space outside the border.

There are multiple ways to specify padding and margins. If given as a scalar, it is constant across all sides. If two values are given, they correspond to the horizontal and vertical sides. If four values are given, they correspond to `[left, top, right, bottom]`.

The `adjust` flag controls whether padding/margins are adjusted for the aspect ratio. If `true`, horizontal and vertical components are scaled so that their ratio is equal to the `child` element's aspect ratio. This yields padding/margins of constant apparent size regardless of aspect ratio. If `false`, the inputs are used as-is.

Parameters:
- `padding` = `0` / `0.1` — the padding to be added (inside border)
- `margin` = `0` / `0.1` — the margin to be added (outside border)
- `border` = `0` / `1` — the border width to use
- `rounded` = `0` / `0.1` — the border rounding to use
- `adjust` = `true` — whether to adjust values for aspect ratio
- `flex` = `false` — if `true`, do *not* inherit `child` aspect ratio
- `shape` = `Rect` — the shape class to use for the border

Subunit names:
- `border` — keywords to pass to border, such as `stroke` or `stroke-dasharray`
