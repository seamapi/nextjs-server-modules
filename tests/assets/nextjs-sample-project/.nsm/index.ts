import routes from "./generated_routes"
import micro from "micro"
import getPort from "get-port"
import { apiResolver } from "./nextjs-middleware/api-utils"
import { IncomingMessage } from "http"
import getRouteMatcher from "./route-matcher"
import querystring from "querystring"

export const runServer = async ({
  port,
  staticDir = "../.next/static",
  middlewares = [],
}) => {
  const routeMatcher = getRouteMatcher(routes)
  const server = micro(async (req: IncomingMessage, res) => {
    const query = querystring.parse(req.url.split("?").slice(1).join("?"))
    req.url = req.url.split("?")[0]
    const { serverFunc, match } = routeMatcher(req.url) || {}
    if (!serverFunc) {
      res.status(404).end("404") // TODO use routes 404
      return
    }
    await apiResolver(req, res, { ...query, ...match }, serverFunc, {}, false)
  })
  server.listen({ port })
}

if (!module.parent) {
  runServer({ port: 3000 })
}

export default runServer
