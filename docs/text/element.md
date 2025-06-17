# Element

The base class for all `gum.js` objects. You will usually not be working with this object directly unless you are implementing your own custom elements. An **Element** has a few methods that can be overriden, each of which takes a [Context](/docs/context) object as an argument. The vast majority of implementations will override only `props` and `inner` (for non-unary elements).

Parameters:
- `children` = `[]` — a list of child elements
- `tag` = `g` — the SVG tag associated with this element
- `unary` = `false` — whether there is inner text for this element
- `aspect` = `null` — the width to height ratio for this element
- `...` = `{}` — additional attributes that are included in `props`

Methods:
- `props(ctx)` — returns a dictionary of attributes for the SVG element. The default implementation returns the non-null `attr` passed to the constructor
- `inner(ctx)` — returns the inner text of the SVG element (for non-unary). Defaults to returing empty string
- `svg(ctx)` — returns the rendered SVG of the element as a `String`. Default implementation constructs SVG from `tag`, `unary`, `props`, and `inner`
