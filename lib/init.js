const glob = require("glob-promise")
const path = require("path")
const rimraf = require("rmfr")
const copyDir = require("recursive-copy")
const prettier = require("prettier")
const fs = require("fs/promises")
const findUp = require("find-up")

const init = async ({ dir, verbose, skipNextBuild }) => {
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

  const nsmDir = `${dir}/.nsm`

  logv("removing and copying nsm... ", { nsmDir })
  await rimraf(nsmDir)
  await copyDir(path.resolve(__dirname, "../nsm"), nsmDir)

  return { packageDirWithNext, nsmDir }
}

module.exports = { init, default: init }
