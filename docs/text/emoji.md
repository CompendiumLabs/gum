# Emoji

<span class="inherit">[Text](#Text) > [Element](#Element)</span>

Creates a new `Emoji` element from a Github emoji name (like "smile" = "🙂"). This is a specialized version of `Text` that accepts the name of the emoji as a regular ASCII string. Note that you do not need to include the ":" characters around the name.

You can find a list of the Github emoji names [here](https://github.com/ikatyang/emoji-cheat-sheet). If the emoji is not found, it will display the name in red. Note that you can also simply use the `Text` element to display an emoji by passing the emoji character itself as the text, rather than the name.

Arguments:

- `name`: the name of the emoji
