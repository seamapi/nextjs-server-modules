const path = require("path")
const prettier = require("prettier")
const fs = require("fs/promises")
const { existsSync } = require("fs")

async function generateRoutes() {
  const pagesDir = path.resolve(__dirname, "../../.next/server/pages")

  const pagesManifest = JSON.parse(
    await fs.readFile(path.resolve(pagesDir, "../pages-manifest.json"))
  )

  const routesFile = prettier.format(
    `import path from "path"

export default {
  ${Object.entries(pagesManifest)
    .map(([route, fp]) => {
      if (!fp.startsWith("pages/api")) {
        return `"${route}": path.resolve(__dirname, "../.next/server/${fp}")`
      }
      return `"${route}": require("../${fp.split(".")[0]}")`
    })
    .join(",")}
}

`,
    { semi: false }
  )

  await fs.writeFile(
    path.resolve(__dirname, "../generated_routes.ts"),
    routesFile
  )
}

module.exports = { generateRoutes }

if (!module.parent) {
  generateRoutes()
}
