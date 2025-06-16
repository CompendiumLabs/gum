# Context

This is the class the handles the flow of information down the `Element` chain as rendering happens. Essentially, it contains information about the absolute location (in pixels) of the current `Element` and provides methods for mapping from coordinate positions within that `Element` (such as `[0.3, 0.6]`) to pixel positions (such as `[100, 250]`).

The most commonly used would be `mapPoint` for positions, `mapRect` for areas, and `mapSize` for sizes. These are used as the core logic in most custom `Element` classes. See [Element](/docs/element) for more information on their proper usage in that setting.

The `map` function is used generate a subcontext for child elements. The input `rect` specifies where to place the child in the coordinate system of the parent, while the `coord` argument specifies a new coordinate system for the child to use. The canonical usage of the `coord` argument is in [Graph](/docs/graph), where we want to place the graph in a particular spot but specify child positions in an arbitrary coordinate system.

For children with `null` aspects, this is the end of the story. However, when the child aspect is specified, we may not be able to fit it into `rect` snugly. In this case we either shrink it down so that if fits both vertically or horizontally (`expand = false`) or blow it up until it (weakly) exceeds its bounds in both directions (`expand = true`). Related complications are introduced when `rotate` is non-null. See [Group](/docs/group) for a list of inputs to `map`.

Methods:
- `constructor({ prect, coord })`: create a new `Context`
- `mapPoint(point)`: map a coordinate position to a pixel position
- `mapRect(rect)`: map a coordinate rectangle to a pixel rectangle
- `mapSize(size)`: map a coordinate size to a pixel size
- `mapRange(direc, limit)`: map a coordinate range to a pixel range
- `map({ rect, aspect, expand, align, rotate, invar })`: return a sub-`Context` for a given coordinate rectangle
