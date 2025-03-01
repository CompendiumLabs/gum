# Text

<span class="inherit">[Element](#Element)</span>

Creates a new `Text` element. Uses built-in browser facilities when available to calculate font size and aspect ratio. Note that you will typically not set the size of the text here, as this will fill the entire `Element` with the provided text. If you wish to place and size the text, wrap this in a container such as `Place` as seen in the example.

There are a number of related elements that can handle different types of text:
- `MultiText` can handle multiple lines of text that are passed in as an array
- `TextFrame` can handle text with a border and background a la `Frame`
- `Emoji` is specialized for the display of emoji characters
- `Math` is specialized for the display of LaTeX expressions

Positional arguments:

- `text`: a string to be used as the content

Keyword arguments:

- `font_family` = `'IBMPlexSans'`: the font family (for display and size calculations)
- `font_weight` = `100`: the font weight (for display and size calculations)
- `color` = `black` = sets the text color using both stroke and fill (this is the usual way)
- `offset` = `[0.0, -0.13]`: offset of the text relative to its bounding box
- `scale` = `1`: size of the box relative to its bounding box
