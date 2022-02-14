import test from "ava"
import { build } from "lib/build"
import path from "path"
import axios from "axios"

test("no rewrite with query", async (t) => {
  await build({
    dir: path.resolve(__dirname, "assets", "nextjs-sample-project"),
  })
  const getServerFixture = require(path.resolve(
    __dirname,
    "assets",
    "nextjs-sample-project",
    ".nsm",
    "get-server-fixture.ts"
  ))

  const {serverURL} = await getServerFixture.default(t)

  const response = await axios.get(`${serverURL}/somepage?with=query`)

  t.is(response.status, 200)
})
