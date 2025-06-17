// plot two lines: (1) a sine wave in red; (2) the same sine wave with a lower amplitude higher frequency sine wave added on top (in blue)
const xlim = [0, 2*pi]
const ylim = [-1.5, 1.5]
const func = x => sin(x) + 0.2*sin(5*x)
return <Frame margin={0.2}>
  <Plot xlim={xlim} ylim={ylim} aspect={phi} grid>
    <SymPath fy={sin} xlim={xlim} stroke={red} stroke_width={2} />
    <SymPath fy={func} xlim={xlim} stroke={blue} stroke_width={2} />
  </Plot>
</Frame>
