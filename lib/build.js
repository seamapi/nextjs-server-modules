const path = require("path")
const findUp = require("find-up")
const { init } = require("./init")

const build = async ({
  dir,
  verbose,
  skipBuild,
  nextless,
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

  logv({ skipBuild, onlyApiFiles })

  if (!skipBuild) {
    const nextjsOptions = {
      build: require(`${packageDirWithNext}/node_modules/next/dist/build/index`).default,
      generateRoutes: require(`${dir}/.nsm/scripts/generate-routes.js`).generateRoutes,
    }

    const nextlessOptions = {
      build: require(`${dir}/.nsm/scripts/nsm-build.js`).nsmBuild,
      generateRoutes: require(`${dir}/.nsm/scripts/generate-routes.js`).generateNsmRoutes, 
    }
    
    const executionOptions = nextless ? nextlessOptions : nextjsOptions

    // Run the build command
    logv("building...")
    await executionOptions.build(dir, null, false, false, false)
    // Run the generateRoutes command
    logv("generating routes...")
    await executionOptions.generateRoutes({
      onlyApiFiles,
    })
  }

  logv("copying nextjs config...")
  await require(`${dir}/.nsm/scripts/copy-nextjs-config.js`).copyNextjsConfig()
}

module.exports = { build, default: build }
