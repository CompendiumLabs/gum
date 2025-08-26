// gum express server

import express from 'express'
import { program } from 'commander'
import { evaluateGum } from './eval.js'
import { renderSvg } from './render.js'

// get host and port args from cli
program
  .option('-h, --host <host>', 'host to listen on', 'localhost')
  .option('-p, --port <port>', 'port to listen on', parseInt, 3000)
  .parse()
const { host, port } = program.opts()

// create express app
const app = express()
app.use(express.text());

// status message
app.get('/', (req, res) => {
  res.send('GUM')
})

// eval gum jsx to svg
app.post('/eval', (req, res) => {
  // get params
  const { size: size0 = 500 } = req.query
  const code = req.body
  const size = parseInt(size0)

  // check for code
  if (code.length == 0) {
    return res.status(400).send('No code provided')
  }

  // evaluate code and return svg
  let svg
  try {
    svg = evaluateGum(code, { size })
  } catch (error) {
    const { message } = error
    return res.status(500).send(message)
  }

  // send svg
  res.setHeader('Content-Type', 'image/svg+xml')
  res.send(svg)
})

// render gum jsx to png
app.post('/render', (req, res) => {
  // get params
  const { size: size0 = 500 } = req.query
  const code = req.body
  const size = parseInt(size0)

  // check for code
  if (code.length == 0) {
    return res.status(400).send('No code provided')
  }

  // evaluate code and render to png
  let png
  try {
    const svg = evaluateGum(code, { size })
    png = renderSvg(svg, { size })
  } catch (error) {
    const { message } = error
    return res.status(500).send(message)
  }

  // send png
  res.setHeader('Content-Type', 'image/png')
  res.send(png)
})

// start server
app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`)
})
