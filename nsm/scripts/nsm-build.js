const { build } = require("tsup")
const path = require("path")
const { existsSync } = require("fs")

async function nsmBuild() {
  const nsmDir = path.resolve(__dirname, "../../.nsm")

  let entry = [path.resolve(__dirname, "../../src/pages/api")]
  if (existsSync(path.join(__dirname, "../../pages"))) {
    entry = [path.resolve(__dirname, "../../pages/api")]
  }

  return build({
    tsconfig: path.resolve(__dirname, "../../tsconfig.json"),
    entry,
    outDir: path.resolve(nsmDir, "pages", "api"),
    splitting: true,
    sourcemap: false,
    clean: true,
  })
}

exports.nsmBuild = nsmBuild
