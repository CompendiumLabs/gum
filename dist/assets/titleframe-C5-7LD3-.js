const e=`// Various food emojis are arrnaged in a spaced out grid and framed with the title "Fruits & Veggies". Each emoji is framed by a rounded square with a gray background.
const emoji = [ '🍇', '🥦', '🍔', '🍉', '🍍', '🌽', '🍩', '🥝', '🍟' ]
return <TitleFrame title="Fruits & Veggies" title-size={0.065} margin padding rounded>
  <Grid rows={3} spacing={0.05}>
    {emoji.map(e => <TextFrame emoji rounded fill="#e6e6e6" aspect={1}>{e}</TextFrame>)}
  </Grid>
</TitleFrame>
`;export{e as default};
