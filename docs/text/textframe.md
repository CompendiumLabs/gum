# TextFrame

[Frame](/docs/frame) > [Element](/docs/element)

This is a specialized relative of [Text](/docs/text) that wraps the text in a [Frame](/docs/frame). It also dispatches handling to the other **Text** variants such as **MultiText**, [Emoji](/docs/emoji), and [Latex](/docs/latex). This makes it a good general-purpose text element.

Parameters:
- `latex` — whether to render LaTeX
- `emoji` — whether to render emoji
- `border` = `1` — the border width
- `padding` = `0.1` — the padding
- `spacing` = `0.02` — the spacing between lines (for multi-line text)
