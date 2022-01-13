import routes from "./generated_routes"
import micro from "micro"
import { apiResolver } from "./nextjs-middleware/api-utils"
import { IncomingMessage } from "http"
import getRouteMatcher from "./route-matcher"
import querystring from "querystring"
import fs from "fs/promises"
import path from "path"
import Debug from "debug"
import wrappers from "@seamapi/wrappers"
import resolveRewrites from "./nextjs-middleware/resolve-rewrites"
import nextConfig from "./next.config"

const debug = Debug("nsm")

export const runServer = async ({ port, middlewares = [] }) => {
  debug(`starting server on port ${port}`)

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
        ...(nextConfig as any).rewrites,
      },
      query,
      (s) => s
    )
    req.url = resolveResult.resolvedHref || req.url
    debug(`resolved request to "${req.url}"`)

    req.url = req.url.split("?")[0]

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

    const wrappedServerFunc = (wrappers as any)(
      ...[...middlewares, serverFunc?.default || serverFunc]
    )

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

export default runServer