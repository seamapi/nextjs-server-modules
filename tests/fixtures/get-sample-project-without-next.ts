import execa from "execa"
import { build } from "lib/build"
import path from "path"

export const getSampleProject = async () => {
  const projectPath = path.resolve(__dirname, "assets", "nextjs-sample-project")

  await execa("yarn", [], { cwd: projectPath })

  await build({
    dir: projectPath,
    verbose: false,
    skipBuild: false,
    nextless: true,
    onlyApiFiles: true,
  })

  const getNsmIndex = require(
    path.resolve(
      __dirname,
      "assets",
      "nextjs-sample-project",
      ".nsm",
      "index.ts",
    ),
  )

  const getServerFixture = require(
    path.resolve(
      __dirname,
      "assets",
      "nextjs-sample-project",
      ".nsm",
      "get-server-fixture.ts",
    ),
  )

  return {
    getNsmIndex: getNsmIndex.default,
    getServerFixture: getServerFixture.default,
  }
}
