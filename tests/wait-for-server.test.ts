import test from "ava"
import getPort from "get-port"
import { getSampleProject } from "./fixtures/get-sample-project"

test("wait for server to start or throw", async (t) => {
  const { nsmIndex } = await getSampleProject()

  const port = await getPort()
  const server = await nsmIndex({ port })
  await t.throwsAsync(() => nsmIndex({ port }), { code: 'EADDRINUSE' })
  server.close()
})
