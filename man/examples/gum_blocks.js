// Letters stacked like blocks spelling out the word "GUM".
let [g, u, m] = 'GUM'.split('').map(t =>
  TextFrame(t, {aspect: 1, fill: '#EEE', border: 3})
);
let s = VStack([g, HStack([u, m])], {expand: false});
return Frame(s, {margin: 0.02});
