# Network

[Group](/docs/group) > [Element](/docs/element)

Network diagrams can be created using the [Node](/docs/node) and [Edge](/docs/edge) classes. This automatically processes Node and Edge children to create a network diagram. It will also display non-network elements as they would be displayed in a [Graph](/docs/graph).

You can specify the internal coordinate system using the `coord` argument, which is a 4-element array specifying the position of the bottom left corner and the width and height of the coordinate system. For example, `coord: [0, 0, 1, 1]` specifies the unit square. When using `Graph`, one can also pass in `xlim`/`ylim` arguments to specify the extent of the graph.

Parameters:
- `coord` — the internal coordinate system to use, a 4-element array specifying the position of the bottom left corner and the width and height of the coordinate system

Subunits:
- `node`/`edge` — the nodes and edges, respectively (TODO)
