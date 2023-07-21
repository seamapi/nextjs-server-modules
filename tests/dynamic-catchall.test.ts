import test from "ava"
import getPort from "get-port"
import axios from "axios"
import { getSampleProject } from "./fixtures/get-sample-project"

test("dynamic catchall path", async (t) => {
  const {getNsmIndex} = await getSampleProject()
  const port = await getPort()

  const server = await getNsmIndex({ port })

  const { data: {query, requestUrl} } = await axios.get(`http://localhost:${port}/dir2/some/route/params?searchParam=a-value`)

  t.is(requestUrl, "/dir2/some/route/params?searchParam=a-value")

  t.deepEqual(query, {
    param3: ['some', 'route', 'params'],
    searchParam: 'a-value'
  })

  server.close()
})
