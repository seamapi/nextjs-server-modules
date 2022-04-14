const glob = require("glob-promise")
const path = require("path")
const rimraf = require("rmfr")
const copyDir = require("recursive-copy")
const prettier = require("prettier")
const fs = require("fs/promises")
const findUp = require("find-up")

const build = async ({ dir }) => {
  const packageDirWithNext =
    (await findUp(
      async (directory) => {
        const hasNext = await findUp.exists(
          path.join(directory, "node_modules/next")
        )
        return hasNext && directory
      },
      {
        type: "directory",
        cwd: dir,
      }
    )) || dir
  try {
    require.resolve(`${packageDirWithNext}/node_modules/next`)
  } catch (e) {
    throw new Error(
      `Couldn't find next module, it might not be installed in your project. I checked the path: "${dir}/node_modules/next"`
    )
  }

  const nsmDir = `${dir}/.nsm`

  await rimraf(nsmDir)
  await copyDir(path.resolve(__dirname, "../nsm"), nsmDir)

  const nextBuild =
    require(`${packageDirWithNext}/node_modules/next/dist/build/index`).default

  await nextBuild(dir, null, false, false, false)

  const nextDir = `${dir}/.next`

  // Run the generateRoutes command
  console.log("generating routes...")
  await require(`${dir}/.nsm/scripts/generate-routes.js`).generateRoutes()
  console.log("copying nextjs config...")
  await require(`${dir}/.nsm/scripts/copy-nextjs-config.js`).copyNextjsConfig()
}

module.exports = { build, default: build }
