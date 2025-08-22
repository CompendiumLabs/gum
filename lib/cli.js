// gum cli

import { program } from 'commander'
import { Resvg } from '@resvg/resvg-js'
import { evaluateGum } from './eval.js'

// wait for stdin
function waitForStdin() {
  return new Promise((resolve) => {
      process.stdin.setEncoding('utf8');
      process.stdin.once('data', (data) => {
          resolve(data.trim());
      });
  });
}

// render svg to png
function renderSvg(svg, size) {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      width: size,
    },
    font: {
      fontFiles: ['./lib/fonts/IBMPlexSans-Regular.ttf'],
      loadSystemFonts: false,
    }
  })
  const data = resvg.render()
  return data.asPng()
}

// get options from commander
program
  .option('-s, --size <size>', 'size of the image', 500)
  .parse()
const { size } = program.opts()

// wait for stdin
const code = await waitForStdin()

// check for code
if (code.length == 0) {
  console.error('No code provided')
  process.exit(1)
}

// render svg to png
const svg = evaluateGum(code, { size })
const png = renderSvg(svg, size)

// print png to stdout
process.stdout.write(png)
