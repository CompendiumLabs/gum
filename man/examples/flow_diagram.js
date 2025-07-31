// A flow diagram with three nodes arranged horizontally: "Input", "Causal Self Attention", and "Perceptron". There are unidirectional arrows going from left to right, connecting the first and second nodes and the second and third nodes, each with the label "Layer Norm". Each node is a rectangle with slightly rounded corners.
let net = Network([
  ['input', 'Input', [0.15, 0.5], [0.1, 0.2]],
  ['attn', ['Causal Self', 'Attention'], [0.5, 0.5], [0.1, 0.4]],
  ['percep', 'Perceptron', [0.85, 0.5], [0.1, 0.2]],
], [
  ['input', 'attn'], ['attn', 'percep']
], {
  aspect: 8, directed: true, node_border_rounded: 0.05, arrow_size: 0.03
});
let notes = Points([[0.32, 0.4], [0.67, 0.4]], {
    shape: Text('Layer Norm'), size: 0.08
});
return Group([net, notes]);
