const glob = require("glob-promise")
const mkdirp = require("mkdirp")
const path = require("path")
const prettier = require("prettier")
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
    const fileContentB64 = (await fs.readFile(`${nextDir}/${fp}`)).toString(
      "base64"
    )
    const outFilePath = path.resolve(
      __dirname,
      "../generated_static",
      `${fp}.ts`
    )
    const outFileContent = `export default Buffer.from(\`${fileContentB64}\`, "base64")`
    await mkdirp(path.dirname(outFilePath))
    await fs.writeFile(outFilePath, outFileContent)
  }

  const routesFile = prettier.format(
    `import serveStatic from "./serve-static"
    export default {
  ${Object.entries(pagesManifest)
    .map(([route, fp]) =>
      fp.startsWith("pages/api")
        ? `"${route}": require("../${fp.split(".").slice(0, -1).join(".")}")`
        : `"${route}": serveStatic("${
            fp.split(".").slice(-1)[0]
          }", require("./generated_static/server/${fp}.ts").default)`
    )
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

if (!module.parent) {
  generateRoutes()
}
