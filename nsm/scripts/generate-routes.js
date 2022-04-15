const glob = require("glob-promise")
const mkdirp = require("mkdirp")
const path = require("path")
const prettier = require("prettier")
const { existsSync } = require("fs")
const fs = require("fs/promises")

async function generateRoutes() {
  const nextDir = path.resolve(__dirname, "../../.next")
  const pagesDir = path.resolve(nextDir, "server/pages")
  const staticDir = path.resolve(nextDir, "static")

  const staticFiles = (await glob("**/*", { cwd: staticDir }))
    .map((fp) => `static/${fp}`)
    .concat(
      (await glob("**/*", { cwd: pagesDir }))
        .filter((fp) => !fp.startsWith("api"))
        .filter((fp) => !fp.endsWith(".nft.json"))
        .map((fp) => `server/pages/${fp}`)
    )
    .filter((fp) => fp.includes("."))

  const pagesManifest = JSON.parse(
    await fs.readFile(path.resolve(pagesDir, "../pages-manifest.json"))
  )

  for (const fp of staticFiles) {
    const fileContentB64 = (
      await fs.readFile(path.resolve(nextDir, fp))
    ).toString("base64")
    const outFilePath = path.resolve(
      __dirname,
      "../generated_static",
      `${fp}.ts`
    )
    const outFileContent = `export default Buffer.from(\`${fileContentB64}\`, "base64")`
    await mkdirp(path.dirname(outFilePath))
    // Fixes race condition on MAC
    await new Promise((resolve) => setTimeout(resolve, 10))
    await fs.writeFile(outFilePath, outFileContent)
  }

  let pagesDirRelativePath = ".."
  if (existsSync(path.join(__dirname, "../src/pages"))) {
    pagesDirRelativePath = "../src"
  }

  const routesFile = prettier.format(
    `import serveStatic from "./serve-static"
    export default {
  ${Object.entries(pagesManifest)
    .map(([route, fp]) => {
      const fpNoExt = fp.split(".").slice(0, -1).join(".")
      const fpExt = fpNoExt.split(".").slice(-1)[0]
      return fp.startsWith("pages/api")
        ? `"${route}": require("${pagesDirRelativePath}/${fpNoExt}")`
        : `"${route}": serveStatic("${fpExt}", require("./generated_static/server/${fp}.ts").default)`
    })
    .join(",")},
    ${staticFiles
      .filter((fp) => fp.startsWith("static/"))
      .map(
        (fp) =>
          `"/_next/${fp}": serveStatic("${
            fp.split(".").slice(-1)[0]
          }", require("./generated_static/${fp}.ts").default)`
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

if (require.main === module) {
  generateRoutes()
}
