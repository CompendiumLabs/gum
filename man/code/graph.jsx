// a series of closely spaced squares rotating clockwise along a sinusoidal path
const sqr = x => <Square rotate={r2d*x} invar />
return <Frame margin>
  <Graph>
    <SymPoints fy={sin} shape={sqr} size={0.5} xlim={[0, 2*pi]} N={150} />
  </Graph>
</Frame>
