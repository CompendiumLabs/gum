# BarPlot

<span class="inherit">[Plot](#Plot) > [Container](#Container) > [Element](#Element)</span>

Makes a plot featuring a bar graph. This largely wraps the functionality of `Plot` and `Bars` but takes care of labelling and arranging the `xaxis` information.

Positional arguments:
- `bars` — a list of of `[label, height]` tuples or a list of `[label, [height, bar]]` tuples where `bar` is the `Element` to use for bar creation

Keyword arguments:
- `direc` = `v` — the orientation of the bars in the plot
- `padding` = `0.1` — how much to trim off bars for spacing (bars are touching when this is zero)

Subunit names:
- `bar` — keywords to pass to the underlying `Bars` element
