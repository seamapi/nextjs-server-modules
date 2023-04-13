const path = require("path")
const rimraf = require("rmfr")
const copyDir = require("recursive-copy")

const init = async ({ dir, verbose }) => {
  const logv = verbose ? console.log : () => {}

  const nsmDir = `${dir}/.nsm`

  logv("removing and copying nsm... ", { nsmDir })
  await rimraf(nsmDir)
  await copyDir(path.resolve(__dirname, "../nsm"), nsmDir)

  return { nsmDir }
}

module.exports = { init, default: init }
