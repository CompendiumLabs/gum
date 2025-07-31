# Graph

*Inherits*: [Group](/docs/group) > [Element](/docs/element)

This is the core graphing functionality used in [Plot](/docs/plot) without the axes and labels. The default coordinate system is the unit square, `[0, 0, 1, 1]`. This can be overridden with custom `xlim`/`ylim` specifications. The Elements that are passed to **Graph** can express their position and size information in this new coordinate system.

Parameters:
- `xlim`/`ylim` = `[0, 1]` — the range over which to graph
- `padding` = `0` — limit padding to add when auto-detected from `elems`
- `flex` = `false` — if true, aspect is set to `null` rather than inferred from limits
- `coord` — the coordinate system to use for the graph (overrides `xlim`/`ylim`)
