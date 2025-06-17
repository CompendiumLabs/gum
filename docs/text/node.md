# Node

[Frame](/docs/frame) > [Element](/docs/element)

This is a container class that encloses text in a **Frame** at a particular position. Passing a string or list of strings to `text` will automatically create a **MultiText** node. One can also simply pass a generic **Element**. The primary usage of this is in the creation of networks using the [Network](/docs/network) container. You must provide a `label` argument to reference this in an [Edge](/docs/edge) element.

Parameters:
- `label` — a string or **Element** to be used as the label
- `rad` = `0.1` — the radius of the node box (will adjust to aspect)
- `padding` = `0.1` — the padding of the node box
- `border` = `1` — the border width of the node box
- `rounded` = `0.05` — the radius of the corners of the node box

Methods:
- `get_anchor(direc)` — returns the anchor point of the node in the specified direction (`n`, `s`, `e`, `w`)
