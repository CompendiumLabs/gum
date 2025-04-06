// plot the exponential of sin(x) over [0, 2π]

const func = x => exp(sin(x));
const path = new SymPath({
  fy: func,
  xlim: [0, 2*pi],
});
const plot = new Plot(path, {
  aspect: phi,
  ylim: [0, 3],
});
return new Frame(plot, {
  margin: 0.15,
});
