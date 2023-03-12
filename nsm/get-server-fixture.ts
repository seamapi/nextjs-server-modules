// @ts-nocheck
/*

Modeled after nextjs-ava-fixture, this utility function will provide you a
server for your test suite to use.

*/

import { ExecutionContext } from "ava"
import axios from "axios"
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

  // Simplify axios errors
  customAxios.interceptors.response.use(
    (res) => res,
    (err) =>
      err.request && err.response
        ? Promise.reject({
            url: err.request.path,
            status: err.response.status,
            statusText: err.response.statusText,
            response: err.response.data,
            headers: err.response.headers,
          })
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

export default getServerFixture
