# Colors

There are a few functions designed to manipulate colors in HEX, RGB, and HSL formats.

## Constants

- `blue`= `'#1e88e5'` — a neon blue color
- `red`= `'#ff0d57'` — a neon red color
- `green`= `'#4caf50'` — a neon green color

## Functions

- `hex2rgb(hex)` — convert a HEX color string to an RGB array
- `rgb2hex(rgb)` — convert an RGB array to a HEX color string
- `rgb2hsl(rgb)` — convert an RGB array to an HSL array
- `interpolate_hex(hex1, hex2, alpha)` — interpolate between two HEX colors with weight `alpha` and return the result in RGB format. This is useful for creating continuous color palettes.