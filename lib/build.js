const glob = require("glob-promise")
const path = require("path")
const rimraf = require("rmfr")
const copyDir = require("recursive-copy")
const prettier = require("prettier")
const fs = require("fs/promises")

export const build = async ({ dir }) => {
  try {
    require.resolve(`${dir}/node_modules/next`)
  } catch (e) {
    throw new Error(
      `Couldn't find next module, it might not be installed in your project. I checked the path: "${dir}/node_modules/next"`
    )
  }
  const nextBuild = require(`${dir}/node_modules/next/dist/build/index`).default

  await nextBuild(dir, null, false, false, false)

  const nextDir = `${dir}/.next`
  const staticDir = `${nextDir}/static`
  const pagesDir = `${nextDir}/server/pages`
  const packageJSON = JSON.parse(await fs.readFile(`${dir}/package.json`))
  const nsmDir = `${dir}/.nsm`

  await rimraf(nsmDir)
  await copyDir(path.resolve(__dirname, "../nsm"), nsmDir)

  // Run the generateRoutes command
  await require(`${dir}/.nsm/scripts/generate-routes.js`).generateRoutes()
}

export default build
