import test from "ava"
import build from "lib/build"
import path from "path"

test("build and check health", async (t) => {
  await build({
    dir: path.resolve(__dirname, "assets", "nextjs-sample-project"),
  })
})
