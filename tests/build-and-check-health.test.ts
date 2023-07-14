import test from "ava"
import getPort from "get-port"
import axios from "axios"
import { getSampleProject } from "./fixtures/get-sample-project"

test("build and check health", async (t) => {
  const {getNsmIndex} = await getSampleProject()
  const port = await getPort()
  const server = await getNsmIndex({ port })

  const { data: res } = await axios.get(`http://localhost:${port}/api/health`)

  t.truthy(res.includes("healthy!"))

  const { data: htmlRes } = await axios.get(`http://localhost:${port}/somepage`)

  t.truthy(htmlRes.includes("Count"))

  server.close()
})
