// a scatter plot of points with emojis for: mount fuji, a rocket, a whale, a watermellon, and a donut
const emoji = [ '🗻', '🚀', '🐋', '🍉', '🍩' ]
return <Frame margin={0.15}>
  <Plot xlim={[0, 6]} ylim={[0, 6]}>
    {emoji.map((e, i) => <Text pos={[i+1, i+1]} rad={0.4}>{e}</Text>)}
  </Plot>
</Frame>
