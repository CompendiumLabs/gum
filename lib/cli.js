// gum cli

import { program } from 'commander'
import { evaluateGum } from './eval.js'
import { renderSvg } from './render.js'

// wait for stdin
function waitForStdin() {
  return new Promise((resolve) => {
      process.stdin.setEncoding('utf8');
      process.stdin.once('data', (data) => {
          resolve(data.trim());
      });
  });
}

// get options from commander
program
  .option('-s, --size <size>', 'size of the image', (value) => parseInt(value), 500)
  .option('-t, --type <type>', 'type of the image', 'png')
  .parse()
const { size: size0, type } = program.opts()

// wait for stdin
const code = await waitForStdin()
if (code.length == 0) {
  console.error('No code provided')
  process.exit(1)
}

// evaluate gum with size
const elem = evaluateGum(code, { size: size0 })
const svg = elem.svg()
const { size } = elem

// output svg or png
if (type == 'png') {
  const png = renderSvg(svg, { size })
  process.stdout.write(png)
} else if (type == 'svg') {
  process.stdout.write(svg)
} else {
  console.error(`Invalid type: ${type}`)
  process.exit(1)
}
