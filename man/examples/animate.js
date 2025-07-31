let xlim = [0, 2*pi];
function frame({ phase }) {
    let path = SymPath({fy: x => sin(x-phase), xlim});
    return Graph(path, {flex: true});
}
let vars = { phase: Continuous(xlim) };
let anim = Animation(vars, frame, {N: 10});
let plot = VStack(anim.frames);
return Frame(plot, {
    border: 1, margin: [0.1, 0.05], aspect: 0.5
});
