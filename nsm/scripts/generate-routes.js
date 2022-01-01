const glob = require("glob-promise")
const path = require("path")
const prettier = require("prettier")
const fs = require("fs/promises")

async function generateRoutes() {
  const pagesDir = path.resolve(__dirname, "../../.next/server/pages")
  const allPageFiles = (await glob("**/*", { cwd: pagesDir })).filter(
    (fp) => !fp.endsWith(".nft.json") && fp.includes(".")
  )

  const routesFile = prettier.format(
    `const path = require("path")

Object.defineProperty(exports, "__esModule", {
  value: true,
})
exports.default = void 0
var _default = {
  ${allPageFiles
    .map((fp) =>
      fp.startsWith("api")
        ? `"/${fp.split(".js")[0]}": require("../.next/server/pages/${fp}")`
        : `"/${fp}": path.resolve(__dirname, "../.next/server/pages/${fp}")`
    )
    .join(",")}
}
exports.default = _default

`,
    { semi: false }
  )

  await fs.writeFile(
    path.resolve(__dirname, "../generated_routes.js"),
    routesFile
  )
}

module.exports = { generateRoutes }

if (!module.parent) {
  generateRoutes()
}
