// patch test

import { applyDiff } from '../src/patch.js'

// start code
const code0 = `
<TitleFrame title="Sample Data" margin={0.3} fill={gray}>
  <BarPlot ylim={[0, 7]} yticks={8} xlabel="Category" ylabel="Value">
    <Bar label="A" size={3} fill={blue} rounded border-none />
    <Bar label="B" size={6} fill={blue} rounded border-none />
    <Bar label="C" size={1} fill={blue} rounded border-none />
    <Bar label="D" size={4} fill={blue} rounded border-none />
  </BarPlot>
</TitleFrame>
`.trim()

const diff = `
<<<<<<< SEARCH
    <Bar label="A" size={3} fill={blue} rounded border-none />
=======
    <Bar label="A" size={3} fill={red} rounded border-none />
>>>>>>> REPLACE
`.trim()

const code1 = applyDiff(diff, code0)

console.log(code1)
