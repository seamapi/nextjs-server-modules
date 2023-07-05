import execa from "execa"
import { build } from "lib/build"
import path from "path"

export const getSampleProject = async () => {
  const projectPath = path.resolve(__dirname, "assets", "nextjs-sample-project")

  await execa("yarn", [], { cwd: projectPath })

  await build({
    dir: projectPath,
    verbose: false,
    skipNextBuild: false,
  })

  const nsmIndex = require(path.resolve(
    __dirname,
    "assets",
    "nextjs-sample-project",
    ".nsm",
    "index.ts"
  ))

  const getServerFixture = require(path.resolve(
    __dirname,
    "assets",
    "nextjs-sample-project",
    ".nsm",
    "get-server-fixture.ts"
  ))

  return {
    nsmIndex: nsmIndex.default,
    getServerFixture: getServerFixture.default,
  }
}
