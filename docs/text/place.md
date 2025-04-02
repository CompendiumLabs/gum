# Place

<span class="inherit">[Container](#Container) > [Element](#Element)</span>

This is a relatively thin wrapper around [Container](#Container) but accepts only one child element, so it can be useful for cases where `Container` is overkill. If you just want to take an `Element` and put it somewhere in space, this is the easiest way. They keyword arguments below are those used for the advanced placement specification in `Container`.

Positional arguments:
- `child` — the child `Element` to place

Keyword arguments:
- any of the arguments accepted as a placement specification (`spec`) detailed in [Container](#Container).
