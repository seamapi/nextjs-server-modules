import test from "ava"
import { getSampleProject } from "./fixtures/get-sample-project"

test("streaming", async (t) => {
  const {getServerFixture} = await getSampleProject()

  const {axios} = await getServerFixture(t)

  const response = await axios.get("/streaming", {
    data: 'streamed data',
  })

  t.is(response.status, 200)
  t.is(response.data.data, 'streamed data')
})
