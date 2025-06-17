// A plot of an inverted sine wave where the line markers are sized in proportion to the amplitude and the color ranges from blue to red depending on the phase. The x-axis ticks are labeled with multiples of π. The x-axis is labeled "phase" and the y-axis is labeled "amplitude". The title is "Inverted Sine Wave".
const xlim = [0, 2*pi]
const ylim = [-1, 1]
const pal = palette(blue, red, [-1, 1])
const func = x => -sin(x)
const shape = (x, y) => <Circle fill={pal(y)} />
const size = (x, y) => 0.1 * (1+abs(y))/2
const xticks = linspace(0, 2, 6).slice(1).map(x => [x*pi, `${rounder(x, 1)} π`])
return <Frame margin={0.25}>
  <Plot xlim={xlim} ylim={ylim} aspect={1.5} xanchor={0} xaxis_tick_pos="both" xticks={xticks} grid xlabel="phase" ylabel="amplitude" title="Inverted Sine Wave">
    <SymPath fy={func} xlim={xlim} />
    <SymPoints fy={func} xlim={xlim} shape={shape} size={size} N={21} />
  </Plot>
</Frame>
