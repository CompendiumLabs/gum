let letters = ['S', 'V', 'G'].map(Text);
let stack = HStack(letters, {spacing: 0.05});
return SVG(stack, {size: [25, 25], font_weight: 'bold', stroke_width: 0.2});
