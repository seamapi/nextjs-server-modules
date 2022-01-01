const path = require("path")
const prettier = require("prettier")
const fs = require("fs/promises")

async function generateRoutes() {
  const pagesDir = path.resolve(__dirname, "../../.next/server/pages")

  const pagesManifest = JSON.parse(
    await fs.readFile(path.resolve(pagesDir, "../pages-manifest.json"))
  )

  const routesFile = prettier.format(
    `import path from "path"

export default {
  ${Object.entries(pagesManifest)
    .map(([route, fp]) =>
      fp.startsWith("pages/api")
        ? `"${route}": require("../${fp}")`
        : `"${route}": path.resolve(__dirname, "../.next/server/${fp}")`
    )
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
