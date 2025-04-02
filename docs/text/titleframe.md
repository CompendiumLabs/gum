# TitleFrame

<span class="inherit">[Frame](#Frame) > [Element](#Element)</span>

A special type of `Frame` that places a title element in a box centered on the line at the top of the frame. The title element can be either a proper `Element` or a string, in which case it will be wrapped in a `Text` element.

Positional arguments:
- `title` — the text or element to use as the title

Keyword arguments:
- `title_size` = `0.075` — the size of the title element
- `title_fill` = `'white'` — the fill color of the title element
- `title_offset` = `0` — the vertical offset of the title element (`0` is centered, `-1` sits on top, `1` hangs below)
- `title_border` = `1` — the border width to use for the title element
- `title_rounded` = `0.1` — the border rounding of the title element
- `adjust` = `true` — whether to adjust the padding and margin to account for the title element
- `padding` = `0` — the padding to be added (inside border)
- `margin` = `0` — the margin to be added (outside border)
- `border` = `1` — the outer frame border width to use
