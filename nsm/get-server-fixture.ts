// @ts-nocheck
/*

Modeled after nextjs-ava-fixture, this utility function will provide you a
server for your test suite to use.

*/

import type { ExecutionContext } from "ava"
import axios, { AxiosError } from "axios"
import getPort from "get-port"
import { runServer } from "./"

interface Options {
  middlewares?: Array<Function>
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
  })

  customAxios.interceptors.response.use(
    (res) => res,
    (err) =>
      err instanceof AxiosError
        ? Promise.reject(new SimpleAxiosError(err))
        : Promise.reject(err)
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

class SimpleAxiosError extends Error {
  constructor(err: AxiosError) {
    this.url = err.request.path
    this.status = err.response.status
    this.statusText = err.response.statusText
    this.response = err.response.data
    this.headers = err.response.headers
  }
}

export default getServerFixture
