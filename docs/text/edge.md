# Edge

<span class="inherit">[ArrowPath](#ArrowPath) > [Container](#Container) > [Element](#Element)</span>

This creates a cubic spline path from one point to another with optional arrowheads at either or both ends. It is named `Edge` because of its usage in network diagrams. The emenation directions are automatically inferred from the relative point positions but can be overriden as well.

Positional arguments:
- `beg`/`end` — the beginning and ending `Node`s for the path and where the optional arrowheads are placed, or a `[node, direc]` pair where `direc` specifies the emanation direction

Keyword arguments:
- `arrow`/`arrow_beg`/`arrow_end` = `false` — toggles whether the respective arrowheads are included
- `arrow_size` = `0.03` — the arrowhead size to use for both arrows

Subunit names:
- `arrow`/`arrow_beg`/`arrow_end` — the respective arrowheads, with `arrow` being applied to both
- `path` — the connecting line element
