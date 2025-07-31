const r=`// draw a grid of square boxes filled in light gray. each box contains an arrow that is pointing in a particular direction. that direction rotates clockwise as we move through the grid.
const boxes = linspace(0, 360, 10).slice(0, 9).map(th =>
  <Frame padding margin border rounded fill aspect={1}>
    <Group rotate={th} invar>
      <Arrow direc={0} tail={1} pos={[1, 0.5]} rad={0.5} />
    </Group>
  </Frame>
)
return <Frame padding>
  <Grid rows={3} spacing>
    {boxes}
  </Grid>
</Frame>
`;export{r as default};
