import test from "ava"
import getPort from "get-port"
import { getSampleProject } from "./fixtures/get-sample-project"

test.serial("wait for server to start or throw", async (t) => {
  const { getNsmIndex } = await getSampleProject()

  const port = await getPort()
  const server = await getNsmIndex({ port })
  await t.throwsAsync(() => getNsmIndex({ port }), { code: 'EADDRINUSE' })
  server.close()
})
