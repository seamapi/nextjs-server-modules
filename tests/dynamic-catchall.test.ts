import test from "ava"
import { build } from "lib/build"
import path from "path"
import getPort from "get-port"
import axios from "axios"

test("dynamic catchall path", async (t) => {
  await build({
    dir: path.resolve(__dirname, "assets", "nextjs-sample-project"),
  })
  const nsmIndex = require(path.resolve(
    __dirname,
    "assets",
    "nextjs-sample-project",
    ".nsm",
    "index.ts"
  ))

  const port = await getPort()

  const server = await nsmIndex.default({ port })

  const { data: {query, requestUrl} } = await axios.get(`http://localhost:${port}/dir2/some/route/params?searchParam=a-value`)

  t.is(requestUrl, "/dir2/some/route/params")

  t.deepEqual(query, {
    param3: ['some', 'route', 'params'],
    searchParam: 'a-value'
  })

  server.close()
})
