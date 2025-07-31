# Text

*Inherits*: [Element](/docs/element)

Displays text. Uses built-in browser facilities when available to calculate font size and aspect ratio. Note that you will typically not set the font size of the text here, as this will fill the entire space with the provided text.

There are a number of related elements that can handle different types of text:
- **MultiText** can handle multiple lines of text that are passed in as an array
- [TextFrame](/docs/textframe) can handle text with a border and background
- [Emoji](/docs/emoji) is specialized for the display of emoji characters
- [Latex](/docs/latex) is specialized for the display of LaTeX expressions

Parameters:
- `font_family` = `'IBMPlexSans'` — the font family (for display and size calculations)
- `font_weight` = `100` — the font weight (for display and size calculations)
- `font_size` = `null` — only set this to hard-code a specific font size
- `color` = `black` — sets the text color using both stroke and fill (this is the usual way)
- `offset` = `[0.0, -0.13]` — offset of the text relative to its bounding box
