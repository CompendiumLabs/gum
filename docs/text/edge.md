# Edge

[Group](/docs/group) > [Element](/docs/element)

This creates a cubic spline path from one point to another with optional arrowheads at either or both ends. It is named `Edge` because of its usage in network diagrams with [Network](/docs/network). The emanation directions are automatically inferred from the relative point positions but can be overriden as well.

Parameters:
- `node1`/`node2` — the beginning and ending [Node](/docs/node) for the path and where the optional arrowheads are placed, or a `[node, direc]` pair where `direc` specifies the emanation direction
- `dir1`/`dir2` — the emanation directions of the arrowheads, either `'n'`/`'s'`/`'e'`/`'w'` or a `[dx, dy]` pair
- `arrow`/`arrow_beg`/`arrow_end` — toggles whether the respective arrowheads are included. Defaults to `true` for `arrow_end` and `false` for `arrow_beg`
- `arrow_size` = `0.03` — the arrowhead size to use for both arrows
- `arrow_base` — toggles whether the arrowhead base is included

Subunits:
- `arrow`/`arrow_beg`/`arrow_end` — the respective arrowheads, with `arrow` being applied to both
- `path` — the connecting line element
