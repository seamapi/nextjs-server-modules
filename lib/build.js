const glob = require("glob-promise")
const path = require("path")
const rimraf = require("rmfr")
const copyDir = require("recursive-copy")
const prettier = require("prettier")
const fs = require("fs/promises")
const findUp = require("find-up")

const build = async ({ dir, verbose, skipNextBuild }) => {
  const logv = verbose ? console.log : () => {}
  const { nsmDir, packageDirWithNext } = await init({ dir, verbose })

  logv({ skipNextBuild })
  if (!skipNextBuild) {
    const nextBuild =
      require(`${packageDirWithNext}/node_modules/next/dist/build/index`).default

    await nextBuild(dir, null, false, false, false)
  }

  // Run the generateRoutes command
  console.log("generating routes...")
  await require(`${dir}/.nsm/scripts/generate-routes.js`).generateRoutes()
  console.log("copying nextjs config...")
  await require(`${dir}/.nsm/scripts/copy-nextjs-config.js`).copyNextjsConfig()
}

module.exports = { build, default: build }
