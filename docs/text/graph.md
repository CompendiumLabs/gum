# Graph

<span class="inherit">[Container](#Container) > [Element](#Element)</span>

This is just the core graphing functionality used in [Plot](#Plot) without the axes and labels. The default coordinate system in `gum.js` is the `[0, 0, 1, 1]` space. This overrides that with custom `xlim`/`ylim` specifications. Thus `Elements` that are passed to `Graph` can express their position and size information in this new coordinate system, rather than having to calculate them on their own.

Positional arguments:
- `elems`: either a single `Element` or a list of `Element`s to graph

Keyword arguments:
- `xlim`/`ylim` = `[0, 1]` — the range over which to graph
- `padding` = `0` — limit padding to add when auto-detected from `elems`
- `flex` = `false` — if true, aspect is set to `null` rather than inferred from limits
- `coord` — the coordinate system to use for the graph (overrides `xlim`/`ylim`)
