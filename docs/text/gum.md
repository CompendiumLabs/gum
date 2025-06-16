# gum.js

Welcome to the gum.js docs! Click on an item in the list on the left to get more info about a particular class (usually an [Element](#Element), function, or constant).

Each entry has a description of the operation and arguments of the item and an associated example code snippet. You can edit the code snippet, but note that these will get clobbered if you navigate to another entry! Go to the [main editor](/) for non-ephemeral work.

The syntax is an XML component style one familiar to React developers. The output is pure SVG. You can nest objects in interesting ways and specify their parameters.

## Common Patterns

*Parameter specification*: You can specify boolean parameters like `border` just by writing their name. Some parameters, such as `padding` default to `0` when not specified but have a default true value as well (in that case `0.1`). You can also pass SVG properties such as `stroke-width` directly.

*Subunit arguments*: for compound elements that inherit [Container](#Container), some keyword arguments are passed down to the constituent parts. For instance, in [Plot](#Plot), one can specify arguments intended for the `XAxis` unit by prefixing them with `xaxis-`. For example, setting the `stroke-width` for this subunit can be achieved with `xaxis-stroke-width`.
