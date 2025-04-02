# Node

<span class="inherit">[Place](#Place) > [Container](#Container) > [Element](#Element)</span>

This is a container class that encloses text in a `Frame` at a particular position. Passing a string or list of strings to `text` will automatically create a `MultiText` node. One can also simply pass a generic `Element`. The primary usage of this is in the creation of networks in conjunction with `Edge` objects. Additional keyword arguments are passed to the `Frame` constructor.

Positional arguments:
- `text` — a string, a list of strings, or an `Element` to be used as the content
- `pos` — the position to place the node

Keyword arguments:
- `size` = `0.1` — the size of the node box

Subunit names:
- `text` — keywords to pass to an auto-generated `Text` object or objects

Functions:
- `get_center` — returns the center of the node
- `get_anchor(direc)` — returns the anchor point of the node in the specified direction (`n`, `s`, `e`, `w`)
