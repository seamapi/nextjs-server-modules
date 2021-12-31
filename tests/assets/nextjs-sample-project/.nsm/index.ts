import routes from "./generated_routes"
import micro from "micro"
import getPort from "get-port"
import { apiResolver } from "./nextjs-middleware/api-utils"
import { IncomingMessage } from "http"
import getRouteMatcher from "./route-matcher"
import querystring from "querystring"
import serveHandler from "serve-handler"
import fs from "fs/promises"
import path from "path"

export const runServer = async ({ port, staticDir = "", middlewares = [] }) => {
  if (!staticDir) {
    staticDir = path.resolve(__dirname, "../.next/static")
  }
  const routeMatcher = getRouteMatcher(routes)
  const server = micro(async (req: IncomingMessage, res) => {
    const query = querystring.parse(req.url.split("?").slice(1).join("?"))
    req.url = req.url.split("?")[0]
    if (req.url.startsWith("/_next/static")) {
      req.url = req.url.replace(/^\/_next\/static/, "")
      await serveHandler(req, res, {
        cleanUrls: true,
        public: staticDir,
      })
      return
    }
    const { serverFunc, match, fsPath } = routeMatcher(req.url) || {}
    if (typeof serverFunc === "string") {
      res.statusCode = 200
      res.end(await fs.readFile(serverFunc))
      return
    }
    if (!serverFunc) {
      res.statusCode = 404
      res.end("404") // TODO use routes 404
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
