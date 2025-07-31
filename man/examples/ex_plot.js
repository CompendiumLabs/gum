// Plot showing three points, each one marked with an "x" and the label "hello". The x-axis ranges from -1 to 1, while the y-axis ranges from 0 to 1.
let shape = HStack(['✗', 'hello'].map(Text), {spacing: 0.1});
let points = Points([[-0.3, 0.3], [0.4, 0.6], [-0.5, 0.8]], {shape, size: 0.1});
let plot = Plot(points, {xlim: [-1, 1], ylim: [0, 1]});
return Frame(plot, {margin: 0.2});
