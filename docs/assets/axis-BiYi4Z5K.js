const a=`// a horizontal axis with 5 ticks labeled with emojis for: mount fuji, a rocket, a whale, a watermellon, and a donut
const emoji = ['A', 'B', 'C', 'D', 'E']
const ticks = zip(linspace(0, 1, emoji.length), emoji)
return <Frame margin={0.3}>
  <HAxis ticks={ticks} aspect={15} />
</Frame>
`;export{a as default};
