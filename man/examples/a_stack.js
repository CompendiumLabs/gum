// Three square boxes containing the letter "A", with two boxes stacked vertically on the left side and one box on the right side.
let a = TextFrame('A', {aspect: 1});
let n1 = VStack([a, a]);
let n2 = HStack([n1, a]);
return Frame(n2, {margin: 0.1});
