# gum

Iterative graphic design with AI. Based on `gum.js`, a grammar for SVG creation.

# Models

Provider: `google` <br/>
Model: `gemini-2.5-flash-lite` <br/>
Diff Type: `block`

# Ideas

Gum provides a visual language for creating figures and diagrams. This gives LLMs the ability to rapdily express themselves visually in a way that can be integrated with their text output. The key here relative to diffusion models is the ability to rapidly generate pricise visualizations that can be animated or modified on the fly. They can also be modified iteratively by the user and downloaded and inspected for later use.

# Agentic

Create a canvas for the agent to draw on. Tools available to the agent include:
- Look at a snapshot of the canvas (or a region of the canvas)
- Get a list of the current elements on the canvas (possibly recursive)
- Get the children and properties of an existing element
- Add a new `gum` based element to the canvas
- Remove an existing element from the canvas

# Slides

Slides are simply a series of canvases with a fixed size and aspect ratio. Add in additional slide level tools for agent use. Would allow for code that is common to multiple slides to be shared. Does it make more sense for the slide level to be done in HTML? Custom elements that may be useful slides:

- Bulleted or numbered list of items (mostly for text) with possiblity of indentation (nested lists)
