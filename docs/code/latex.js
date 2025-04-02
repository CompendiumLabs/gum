// There are two latex equations framed by rounded borders arranged vertically. The top one shows a Gaussian integral and the bottom one shows a trigonometric identity. They are framed by a square with the title "Facts".
let tex1 = Latex('\\int_0^{\\infty} \\exp(-x^2) dx = \\sqrt{\\pi}');
let tex2 = Latex('\\sin^2(\\theta) + \\cos^2(\\theta) = 1');
let node1 = TextFrame(tex1, {border_rounded: 0.05});
let node2 = TextFrame(tex2, {border_rounded: 0.05});
let group = Points([[node1, [0.5, 0.3]], [node2, [0.5, 0.7]]], {size: 0.35});
return TitleFrame(group, 'Facts', {border: 1, margin: 0.15});
