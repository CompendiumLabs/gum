# BarPlot

[Plot](/docs/plot) > [Container](/docs/container) > [Element](/docs/element)

Makes a plot featuring a bar graph. This largely wraps the functionality of [Plot](/docs/plot) and [Bars](/docs/bars) but takes care of labelling and arranging the `xaxis` information.

Child attributes:
- `label` — the label for the bar
- `size` — the height of the bar

Parameters:
- `data` — a list of of `[label, height]` arrays
- `direc` = `v` — the orientation of the bars in the plot

Subunit names:
- `bar` — keywords to pass to the underlying **Bars** element
