const { createServer } = require("http")
const next = require("next")
const path = require("path")

module.exports = async ({ port }) => {
  const customServerConf = {
    dev: false,
    dir: path.resolve(__dirname),
    quiet: false,
  }
  console.log({ customServerConf })
  const app = next(customServerConf)
  const handleRequest = app.getRequestHandler()
  await app.prepare()
  const server = createServer((req, res) => {
    return handleRequest(req, res)
  })
  console.log("nextjs-health-endpoint-module listening on", port)
  server.listen(port)
  return { close: () => server.close() }
}

if (!module.parent) {
  module.exports({ port: 3030 })
}
