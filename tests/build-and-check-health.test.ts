import test from "ava"
import { build } from "lib/build"
import path from "path"
import tempy from "tempy"
import getPort from "get-port"
import axios from "axios"

test("build and check health", async (t) => {
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

  const { data: res } = await axios.get(`http://localhost:${port}/api/health`)

  t.truthy(res.includes("healthy!"))

  // check GET /somepage

  const { data: htmlRes } = await axios.get(`http://localhost:${port}/somepage`)

  t.truthy(htmlRes.includes("Count"))

  server.close()
})
