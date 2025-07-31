// Circles spiraling outwards. They have black borders and semi-transparent fills. They are tinted blue at the outside and red towards the inside. They are framed by a circle with a black border and a gray background.
const freq = 38*pi
const pal = palette(red, blue)
const shape = t => <Circle fill={pal(t/freq)} opacity={0.75} />
return <Frame margin>
  <Group>
    <Circle fill="#eee" />
    <Graph xlim={[-1, 1]} ylim={[-1, 1]}>
      <SymPoints
        fx={t => (t/freq) * cos(t)}
        fy={t => (t/freq) * sin(t)}
        shape={(x, y, t) => shape(t)}
        tlim={[0, freq]} N={100} size={0.05}
      />
    </Graph>
  </Group>
</Frame>
