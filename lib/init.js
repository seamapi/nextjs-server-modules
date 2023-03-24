const glob = require("glob-promise")
const path = require("path")
const rimraf = require("rmfr")
const copyDir = require("recursive-copy")
const prettier = require("prettier")
const fs = require("fs/promises")
const findUp = require("find-up")

const init = async ({ dir, verbose }) => {
  const logv = verbose ? console.log : () => {}

  const nsmDir = `${dir}/.nsm`

  logv("removing and copying nsm... ", { nsmDir })
  await rimraf(nsmDir)
  await copyDir(path.resolve(__dirname, "../nsm"), nsmDir)

  return { nsmDir }
}

module.exports = { init, default: init }
