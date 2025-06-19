# BarPlot

[Plot](/docs/plot) > [Container](/docs/container) > [Element](/docs/element)

Makes a plot featuring a bar graph. This largely wraps the functionality of [Plot](/docs/plot) but takes care of labelling and arranging the `xaxis` information. You can provide `label` and `size` attributes to the child elements. The **Bar**/**VBar**/**HBar** elements are just very thin wrappers around **Rect** elements, and you can use other elements in their place if you wish.

Child parameters:
- `label` — the label for the bar
- `size` — the height of the bar

Parameters:
- `direc` = `v` — the orientation of the bars in the plot

Subunit names:
- `bar` — keywords to pass to the underlying **Bars** element
