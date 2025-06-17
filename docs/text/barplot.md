# BarPlot

[Plot](/docs/plot) > [Container](/docs/container) > [Element](/docs/element)

Makes a plot featuring a bar graph. This largely wraps the functionality of [Plot](/docs/plot) and [Bars](/docs/bars) but takes care of labelling and arranging the `xaxis` information.

Positional arguments:
- `bars` — a list of of `[label, height]` tuples or a list of `[label, [height, bar]]` tuples where `bar` is the **Element** to use for bar creation

Keyword arguments:
- `direc` = `v` — the orientation of the bars in the plot
- `size` = `0.9` — how large to make the bars (they are touching when this is `1`)

Subunit names:
- `bar` — keywords to pass to the underlying **Bars** element
