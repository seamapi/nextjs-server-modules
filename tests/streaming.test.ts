import test from "ava"
import { build } from "lib/build"
import path from "path"

test("streaming", async (t) => {
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

  const {axios} = await getServerFixture.default(t)

  const response = await axios.get("/streaming", {
    data: 'streamed data',
  })

  t.is(response.status, 200)
  t.is(response.data.data, 'streamed data')
})
