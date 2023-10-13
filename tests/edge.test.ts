import test from "ava"
import getPort from "get-port"
import axios from "axios"
import { getSampleProject } from "./fixtures/get-sample-project"

test("run edge function", async (t) => {
  const {getNsmIndex} = await getSampleProject()
  const port = await getPort()
  const server = await getNsmIndex({ port })

  t.teardown(() => {
    server.close()
  })

  const { data } = await axios.get(`http://localhost:${port}/api/edge`)
  t.deepEqual(data, {
    isFetchAvailable: true,
    areNodeBuiltinsAvailable: false,
    requestUrl: `http://localhost:${port}/api/edge`
  })
})
