const glob = require("glob-promise")
const path = require("path")
const prettier = require("prettier")
const fs = require("fs/promises")

async function generateRoutes() {
  const pagesDir = path.resolve(__dirname, "../../.next/server/pages")
  const staticDir = path.resolve(__dirname, "../../.next/static")

  const staticFiles = (await glob("**/*", { cwd: staticDir })).filter((fp) =>
    fp.includes(".")
  )

  const pagesManifest = JSON.parse(
    await fs.readFile(path.resolve(pagesDir, "../pages-manifest.json"))
  )

  const routesFile = prettier.format(
    `export default {
  ${Object.entries(pagesManifest)
    .map(([route, fp]) =>
      fp.startsWith("pages/api")
        ? `"${route}": require("../${fp}")`
        : `"${route}": require.resolve("../.next/server/${fp}")`
    )
    .join(",")},
    ${staticFiles.map(
      (fp) => `"/_next/static/${fp}": require.resolve("../.next/static/${fp}")`
    )}
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
