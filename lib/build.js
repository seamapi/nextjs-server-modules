const path = require("path")
const findUp = require("find-up")
const { init } = require("./init")

const build = async ({
  dir,
  verbose,
  skipNextBuild,
  onlyApiFiles = false,
}) => {
  const logv = verbose ? console.log : () => {}
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
  logv({ packageDirWithNext })
  try {
    require.resolve(`${packageDirWithNext}/node_modules/next`)
  } catch (e) {
    throw new Error(
      `Couldn't find next module, it might not be installed in your project. I checked the path: "${dir}/node_modules/next"`
    )
  }

  await init({ dir, verbose })

  logv({ skipNextBuild, onlyApiFiles })

  if (!skipNextBuild) {
    const nextBuild =
      require(`${packageDirWithNext}/node_modules/next/dist/build/index`).default

    await nextBuild(dir, null, false, false, false)
    // Run the generateRoutes command
    logv("generating routes...")
    await require(`${dir}/.nsm/scripts/generate-routes.js`).generateRoutes({
      onlyApiFiles,
    })
  } else {
    const nsmBuild = require(`${dir}/.nsm/scripts/nsm-build.js`).nsmBuild
    // Run the build command
    logv("building nsm...")
    await nsmBuild()
    // Run the generateRoutes command
    logv("generating routes...")
    await require(`${dir}/.nsm/scripts/generate-routes.js`).generateNsmRoutes({
      onlyApiFiles,
    })
  }

  logv("copying nextjs config...")
  await require(`${dir}/.nsm/scripts/copy-nextjs-config.js`).copyNextjsConfig()
}

module.exports = { build, default: build }
