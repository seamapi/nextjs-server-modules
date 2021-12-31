import routes from "./routes"
import micro from "micro"
import getPort from "get-port"
import routeMatcher from "./route-matcher"

export const runServer = async ({
  port,
  staticDir = "../.next/static",
  middlewares = [],
}) => {
  const server = micro((req, res) => {
    const routeFunc = routeMatcher(routes, req.path)
    res.end("hello world")
  })
  server.listen({ port })
}

if (!module.parent) {
  runServer({ port: 3000 })
}

export default runServer
