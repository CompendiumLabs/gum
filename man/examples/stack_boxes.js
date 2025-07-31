// Two side-by-side rectangles, the left one being square and containing a mushroom emoji, the right one containing the world "planet".
let boxes = ['🍄', 'planet'].map(x => TextFrame(x, {padding: 0.15}));
let stack = HStack(boxes);
return Frame(stack, {padding: 0.05});
