// plot an inverted sine wave with ticks labeled in multiples of π. There is a faint dashed grid. The x-axis is labeled "phase" and the y-axis is labeled "amplitude". The title is "Inverted Sine Wave".
const xticks = linspace(0, 2, 6).slice(1).map(x => [x*pi, `${rounder(x, 1)} π`])
return <Frame margin={0.25}>
  <Plot aspect={phi} xanchor={0} xticks={xticks} grid xlabel="phase" ylabel="amplitude" title="Inverted Sine Wave" xaxis_tick_pos="both" grid_stroke_dasharray={3}>
    <SymPath fy={x => -sin(x)} xlim={[0, 2*pi]} />
  </Plot>
</Frame>
