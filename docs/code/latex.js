// There are two latex equations framed by rounded borders arranged vertically. The top one shows a Gaussian integral and the bottom one shows a trigonometric identity. They are framed by a square with the title "Facts".

const tex1 = new Latex(
  '\\int_0^{\\infty} \\exp(-x^2) dx = \\sqrt{\\pi}'
);
const tex2 = new Latex(
  '\\sin^2(\\theta) + \\cos^2(\\theta) = 1'
);
const node1 = new TextFrame(tex1, {
  border_rounded: 0.05,
});
const node2 = new TextFrame(tex2, {
  border_rounded: 0.05,
});
const group = new Points([
  [node1, [0.5, 0.3]],
  [node2, [0.5, 0.7]],
], {
  size: 0.35,
});
return new TitleFrame(group, 'Facts', {
  border: 1,
  margin: 0.15,
});
