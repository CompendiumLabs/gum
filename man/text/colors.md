# Colors

There are a few functions designed to manipulate colors in HEX, RGB, and HSL formats.

## Constants

- `none` = `'none'` — a transparent color
- `white` = `'#ffffff'` — a white color
- `black` = `'#000000'` — a black color
- `blue`= `'#1e88e5'` — a neon blue color
- `red`= `'#ff0d57'` — a neon red color
- `green`= `'#4caf50'` — a neon green color
- `yellow`= `'#ffb300'` — a neon yellow color
- `purple`= `'#9c27b0'` — a neon purple color
- `gray`= `'#f0f0f0'` — a light gray color

## Functions

- `hex2rgb(hex)` — convert a HEX color string to an RGB array
- `rgb2hex(rgb)` — convert an RGB array to a HEX color string
- `rgb2hsl(rgb)` — convert an RGB array to an HSL array
- `palette(beg, end)` — create a palette function that interpolates between two colors
