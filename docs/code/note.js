// plot the function 1 - x^2 and add a note on the top labeling the function
const line = new SymPath({
  fy: x => 1-x*x,
  xlim: [-1, 1],
});
const note = new Note('1 - x^2', {
  pos: [0.025, 1.1],
  rad: 0.15, latex: true,
});
const plot = new Plot([line, note], {
  aspect: phi,
  ylim: [0, 1.5],
  yticks: 4,
  grid: true,
  grid_opacity: 0.1,
});
return new Frame(plot, {margin: 0.15});
