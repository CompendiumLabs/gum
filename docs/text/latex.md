# Math

[Text](/docs/text) > [Element](/docs/element)

Creates a new `Math` math element from LaTeX source. Uses `MathJax` when available to render in SVG and calculate aspect ratio. This is also implicitly accessible through [TextFrame](/docs/textframe) when passing the `latex` flag. As seen in the example, you will probably need to wrap the LaTeX in `{"..."}` to prevent syntax errors.

Parameters:
- `offset` — the position of the center of the element
- `scale` — the proportional size of the element
