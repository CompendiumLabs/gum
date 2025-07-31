# TitleFrame

*Inherits*: [Frame](/docs/frame) > [Element](/docs/element)

A special type of [Frame](/docs/frame) that places a title element in a box centered on the line at the top of the frame. The title element can be either a proper Element or a string, in which case it will be wrapped in a [Text](/docs/text) element.

Parameters:
- `title` — the text or element to use as the title
- `title_size` = `0.075` — the size of the title element
- `adjust` = `true` — whether to adjust the padding and margin to account for the title element
- `border` = `1` — the outer frame border width to use

Subunits:
- `title` — the title element
