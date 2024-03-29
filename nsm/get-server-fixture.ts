// @ts-nocheck
/*

Modeled after nextjs-ava-fixture, this utility function will provide you a
server for your test suite to use.

*/

import type { ExecutionContext } from "ava"
import axios, { AxiosError, CreateAxiosDefaults } from "axios"
import getPort from "get-port"
import { runServer } from "./"

interface Options {
  middlewares?: Array<Function>
  axiosConfig?: CreateAxiosDefaults
}

async function getServerFixture(t: ExecutionContext, options: Options = {}) {
  const port = await getPort()

  if (!options.middlewares) options.middlewares = []

  const server = await runServer({
    port,
    middlewares: options.middlewares as any,
  })

  t.teardown(() => {
    server.close()
  })

  const serverURL = `http://127.0.0.1:${port}`

  const customAxios = axios.create({
    baseURL: serverURL,
    ...options.axiosConfig,
  })

  customAxios.interceptors.response.use(
    (res) => res,
    (err) =>
      err instanceof AxiosError
        ? Promise.reject(new SimpleAxiosError(err))
        : Promise.reject(err),
  )

  return {
    port,
    serverURL,
    axios: customAxios,
    close: () => {
      if (server) {
        server.close()
      }
    },
  }
}

export class SimpleAxiosError extends Error {
  url: AxiosError["request"]["path"]
  status: AxiosError["status"]
  statusText: AxiosError["response"]["statusText"]
  response: AxiosError["response"]["data"]
  headers: AxiosError["response"]["headers"]

  constructor(err: AxiosError) {
    super(err.message)
    this.name = this.constructor.name
    this.url = err.request.path
    this.status = err.response.status
    this.statusText = err.response.statusText
    this.response = err.response.data
    this.headers = err.response.headers
  }
}

export default getServerFixture
