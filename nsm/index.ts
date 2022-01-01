import routes from "./generated_routes"
import micro from "micro"
import { apiResolver } from "./nextjs-middleware/api-utils"
import { IncomingMessage } from "http"
import getRouteMatcher from "./route-matcher"
import querystring from "querystring"
import serveHandler from "serve-handler"
import fs from "fs/promises"
import path from "path"
import Debug from "debug"
import wrappers from "@seamapi/wrappers"
import resolveRewrites from "./nextjs-middleware/resolve-rewrites"

const debug = Debug("nsm")

export const runServer = async ({ port, staticDir = "", middlewares = [] }) => {
  debug(`starting server on port ${port}`)
  if (!staticDir) {
    staticDir = path.resolve(__dirname, "../.next/static")
  }
  let nextConfig = {}
  try {
    nextConfig = require(path.resolve(__dirname, "../.next/next.config.js"))
  } catch (e) {}

  const routeMatcher = getRouteMatcher(routes)
  const server = micro(async (req: IncomingMessage, res) => {
    const query = querystring.parse(req.url.split("?").slice(1).join("?"))
    debug(`got request for "${req.url}"`)
    const resolveResult = resolveRewrites(
      req.url,
      Object.keys(routes),
      {
        afterFiles: [],
        beforeFiles: [],
        fallback: [],
      },
      query,
      (s) => s
    )
    req.url = resolveResult.resolvedHref || req.url
    debug(`resolved request to "${req.url}"`)

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

    const wrappedServerFunc = (wrappers as any)(...[...middlewares, serverFunc])

    await apiResolver(
      req,
      res,
      { ...query, ...match },
      wrappedServerFunc,
      {},
      false
    )
  })
  server.listen({ port })
  return server
}

if (!module.parent) {
  console.log("starting server at http://localhost:3000")
  runServer({ port: 3000 })
}

export default runServer
