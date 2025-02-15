# Grid

<span class="inherit">[Container](#Container)</span>

The `Grid` element creates a container that arranges its children in a grid. The grid is specified by the number of rows and columns, and the gap between the cells.

Positional arguments:
- `children`: An array of arrays of child elements to arrange in the grid.

Keyword arguments:
- `rows` = `N`: The number of rows in the grid (autodetected).
- `cols` = `M`: The number of columns in the grid (autodetected).
- `widths` = `[1/N,...]`: An array of widths for each column.
- `heights` = `[1/M,...]`: An array of heights for each row.
- `spacing` = `0`: The gap between the cells in the grid.
