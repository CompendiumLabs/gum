let data = [1, 3, 4, 2, 3];
let rect = Rect({radius: 0.05, fill: blue, opacity: 0.75});
let note = Place(Text('hello'), {pos: [0.5, -0.15], rad: [null, 0.1], expand: true});
let bar = Group([rect, note]);
let bars = data.map(h => [bar, h]);
let vbars = VBars(bars, {shrink: 0.2});
let graph = Graph(vbars, {aspect: phi});
return Frame(graph, {border: 1, padding: [0.2, 0.05], margin: 0.1});
