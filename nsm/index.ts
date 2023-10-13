// @ts-nocheck
import routes from "./generated_routes"
import { Server } from "http"
import { apiResolver } from "./nextjs-middleware/api-utils"
import getRouteMatcher from "./route-matcher"
import querystring from "querystring"
import fs from "fs/promises"
import Debug from "debug"
import wrappers from "nextjs-middleware-wrappers"
import resolveRewrites from "./nextjs-middleware/resolve-rewrites"
import nextConfig from "./next.config"
import { removePathTrailingSlash } from "./nextjs-middleware/normalize-trailing-slash"
import { getRouteRegex } from "./route-matcher/route-regex"
import type { NextApiHandler } from "./types/nextjs"
import {getRuntimeContext} from "next/dist/server/web/sandbox"


const debug = Debug("nsm")

const TEST_ROUTE = /\/\[[^/]+?\](?=\/|$)/

export function isDynamicRoute(route: string): boolean {
  return TEST_ROUTE.test(route)
}

export function normalizePathSep(path: string): string {
  return path.replace(/\\/g, "/")
}

export function denormalizePagePath(page: string) {
  page = normalizePathSep(page)
  if (page.startsWith("/index/") && !isDynamicRoute(page)) {
    page = page.slice(6)
  } else if (page === "/index") {
    page = "/"
  }
  return page
}

function resolveDynamicRoute(pathname: string, pages: string[]) {
  const cleanPathname = removePathTrailingSlash(denormalizePagePath(pathname!))

  if (cleanPathname === "/404" || cleanPathname === "/_error") {
    return pathname
  }

  // handle resolving href for dynamic routes
  if (!pages.includes(cleanPathname!)) {
    // eslint-disable-next-line array-callback-return
    pages.some((page) => {
      if (isDynamicRoute(page) && getRouteRegex(page).re.test(cleanPathname!)) {
        pathname = page
        return true
      }
    })
  }
  return removePathTrailingSlash(pathname)
}

type Middleware = (next: NextApiHandler) => NextApiHandler

export const runServer = async ({ port, middlewares = [] }: {port: number, middlewares?: Middleware[]}) => {
  debug(`starting server on port ${port}`)

  const routeMatcher = getRouteMatcher(routes)
  const server = new Server(async (req, res) => {
    const query = querystring.parse(req.url!.split("?").slice(1).join("?"))
    debug(`got request for "${req.url}"`)
    const resolveResult = resolveRewrites(
      req.url!,
      Object.keys(routes),
      {
        afterFiles: [],
        beforeFiles: [],
        fallback: [],
        ...(nextConfig as any).rewrites,
      },
      query,
      (s) => resolveDynamicRoute(s, Object.keys(routes))
    )
    debug(`resolved request to "${resolveResult.parsedAs.pathname}"`)

    // todo: rename serverFunc
    const { serverFunc, match, fsPath } =
      routeMatcher(resolveResult.parsedAs.pathname) || {}

    if (typeof serverFunc === "string" && serverFunc.endsWith(".html")) {
      res.statusCode = 200
      res.end(await fs.readFile(serverFunc))
      return
    }
    if (!serverFunc) {
      res.statusCode = 404
      res.end("404") // TODO use routes 404
      return
    }

    const apiHandler = require(serverFunc)

    if (apiHandler.config?.runtime === "edge") {
      // todo: why are delays needed?
      await new Promise(resolve => setTimeout(resolve, 1000))

      const runtime = await getRuntimeContext({
        name: "pages/api/edge",
        onWarning: console.warn,
        useCache: false,
        edgeFunctionEntry: {
          name: "pages/api/edge",
          paths: [
            '/Users/maxisom/Git/nextjs-server-modules/tests/assets/nextjs-sample-project/.next/server/edge-runtime-webpack.js',
            '/Users/maxisom/Git/nextjs-server-modules/tests/assets/nextjs-sample-project/.next/server/pages/api/edge.js'
          ]
        },
        request: {
          headers: req.headers,
          method: req.method,
          url: req.url,
        },
        distDir: '.',
        paths: [
          '/Users/maxisom/Git/nextjs-server-modules/tests/assets/nextjs-sample-project/.next/server/edge-runtime-webpack.js',
          '/Users/maxisom/Git/nextjs-server-modules/tests/assets/nextjs-sample-project/.next/server/pages/api/edge.js'
        ]
      })

      await new Promise(resolve => setTimeout(resolve, 1000))

      // todo: .exports?
      const edgeFunction: (args) => Promise<any> = runtime.context._ENTRIES['middleware_pages/api/edge'].default

      const fullUrl = `http://localhost:${port}${req.url}`
      const result = await edgeFunction({
        request: {
          headers: req.headers,
          method: req.method,
          url: fullUrl,
        }
      })

      await result.waitUntil

      const response = result.response as Response

      res.statusCode = response.status

      for (const header of response.headers) {
        res.setHeader(header[0], header[1])
      }

      res.end(Buffer.from(await response.arrayBuffer()))

      return
    }

    throw new Error("unhandled")

    const wrappedServerFunc = (wrappers as any)(
      ...[...middlewares, apiHandler?.default || apiHandler]
    )

    wrappedServerFunc.config = apiHandler.config || {}

    await apiResolver(
      req,
      res,
      { ...query, ...match },
      wrappedServerFunc,
      {},
      false
    )
  })

  await new Promise<void>((resolve, reject) => {
    server.once('error', (err) => {
      if (err) reject(err)
    })
    server.listen(port, () => {
      resolve()
    })
  })
  return server
}

export default runServer
