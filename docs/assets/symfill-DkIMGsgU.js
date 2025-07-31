const i=`// a decaying sine wave filled in with blue
const xlim = [0, 6*pi]
const decay = x => exp(-0.1*x) * sin(x)
return <Frame margin>
  <Graph aspect={phi}>
    <SymFill fy1={decay} fy2={0} xlim={xlim} fill={blue} fill_opacity={0.5} N={250} />
    <SymPath fy={decay} xlim={xlim} N={250} />
  </Graph>
</Frame>
`;export{i as default};
