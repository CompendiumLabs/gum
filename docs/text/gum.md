# gum.js

Welcome to the gum.js docs! Click on an item in the list on the left to get more info about a particular class (usually an [Element](#Element), function, or constant).

Each entry has a description of the operation and arguments of the item and an associated example code snippet. You can edit the code snippet, but note that these will get clobbered if you navigate to another entry! Go to the <a href="/">main editor</a> for non-ephemeral work.

## Common Patterns

*Keyword arguments*: all subclasses of [Element](#Element) take a dictionary called `args` as their final argument. If not used directly by the element, they are passed down to the `Element` constructor and included as properties of the SVG element. Using this, one can directly set SVG properties. For instance, you could specify `stroke` or `fill` colors directly. Note that you must use `_` in place of `-`, so something like `stroke-width` would be specified as `stroke_width` and automatically converted.

*Subunit arguments*: for compound elements that inherit [Container](#Container), some keyword arguments are passed down to the constituent parts. For instance, in [Plot](#Plot), one can specify arguments intended for the `XAxis` unit by prefixing them with `xaxis_`. For example, setting the `stroke-width` for this subunit can be achieved with `xaxis_stroke_width`.
