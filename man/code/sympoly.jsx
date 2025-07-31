// A circle with an oscilating radius. The circle has a solid black border and is filled in with blue. The result should look like a splat.
const [freq, amp] = [5, 0.25];
const famp = t => 1 + amp * sin(freq*t);
return <Frame padding margin border rounded border_fill="#eee">
  <Graph xlim={[-1, 1]} ylim={[-1, 1]} aspect={1}>
    <SymPoly fx={t => famp(t) * cos(t)} fy={t => famp(t) * sin(t)} tlim={[0, 2*pi]} N={500} fill={blue} opacity={0.75} />
  </Graph>
</Frame>
