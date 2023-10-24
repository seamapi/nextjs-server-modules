import test from "ava"
import axios from "axios"
import { getSampleProject } from "./fixtures/get-sample-project"

test("no rewrite with query", async (t) => {
  const { getServerFixture } = await getSampleProject()

  const { serverURL } = await getServerFixture(t)

  const response = await axios.get(`${serverURL}/somepage?with=query`)

  t.is(response.status, 200)
})
