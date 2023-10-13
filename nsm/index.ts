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
import * as esbuild from "esbuild"
import axios from "axios"
import * as edge from "edge-runtime"


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
      // todo: set dynamically
      const page = "/api/edge"

      const result = await esbuild.build({
        stdin: {
          contents: `
            import {NextRequest} from "next/dist/server/web/spec-extension/request"
            import {NextFetchEvent} from "next/dist/server/web/spec-extension/fetch-event"

            import handler from "${serverFunc}"

            if (typeof handler !== 'function') {
              throw new Error('The Edge Function "pages${page}" must export a \`default\` function');
            }

            addEventListener("fetch", async event => {
              const request = new NextRequest(event.request)
              const nextEvent = new NextFetchEvent({request, page: "${page}"})
              return event.respondWith(await handler(request, nextEvent))
            })
          `,
          resolveDir: __dirname,
          loader: "ts",
        },
        bundle: true,
        format: "iife",
        banner: {
          js: "const process = {env: {}};",
        },
        write: false
      })

      const runtime = new edge.EdgeRuntime({initialCode: result.outputFiles[0].text})
      const edgeServer = await edge.runServer({runtime})
      const port = new URL(edgeServer.url).port

      const response = await axios.request({
        baseURL: `http://localhost:${port}`,
        url: req.url,
        method: req.method,
        headers: req.headers,
        data: req,
        validateStatus: () => true,
        responseType: "arraybuffer",
      })

      for (const header of response.headers) {
        res.setHeader(header[0], header[1])
      }

      res.statusCode = response.status
      res.end(Buffer.from(response.data))

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
