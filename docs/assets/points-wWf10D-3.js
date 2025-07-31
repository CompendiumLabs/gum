const e=`// A plot of three different increasing curves of varying steepness and multiple points spaced at regular intervals. The x-axis label is "time (seconds)", the y-axis label is "space (meters)", and the title is "Spacetime Vibes". There are axis ticks in both directions with assiated faint grid lines.
<Frame margin={0.3}>
  <Plot xlim={[-1, 1]} ylim={[-1, 1]} grid xlabel="time (seconds)" ylabel="space (meters)" title="Spacetime Vibes">
    <Points locs={[[0, 0.5], [0.5, 0], [-0.5, 0], [0, -0.5]]} size={0.015} />
    <Rect pos={[0.5, 0.5]} rad={0.1} />
    <Circle pos={[-0.5, -0.5]} rad={0.1} />
    {[0.5, 0.9, 1.5].map(a =>
      <SymPath fy={x => sin(a*x)} xlim={[-1, 1]} />
    )}
  </Plot>
</Frame>
`;export{e as default};
