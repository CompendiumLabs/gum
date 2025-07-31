const e=`# Rect

*Inherits*: [Element](/docs/element)

This makes a rectangle. Without any arguments it will fill its entire allocated space. Unless otherwise specified, it has a \`null\` aspect. Use **Square** for a square with a unit aspect.

Specifying a \`rounded\` argument will round the borders by the same amount for each corner. This can be either a scalar or a pair of scalars corresponding to the x and y radii of the corners. To specify different roundings for each corner, use the **RoundedRect** element.

Parameters:
- \`rounded\` = \`null\` — proportional border rounding, accepts either scalar or pair of scalars
`;export{e as default};
