import routes from "./routes"
import micro from "micro"
import getPort from "get-port"

export const runServer = async ({
  port,
  staticDir = "./.next",
  middlewares = [],
}) => {
  const server = micro((req, res) => {
    res.end("hello world")
  })
  server.listen({ port })
}

if (!module.parent) {
  runServer({ port: 3000 })
}

export default runServer
