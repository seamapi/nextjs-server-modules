const { glob } = require("glob")
const { mkdirp } = require("mkdirp")
const path = require("path")
const prettier = require("prettier")
const { existsSync } = require("fs")
const fs = require("fs/promises")

const VALID_EXTENSIONS = [".tsx", ".jsx", ".ts", ".js"]

async function generateNsmPagesManifest(rootDir, outputDir) {
  const pagesDir = existsSync(path.resolve(rootDir, "pages"))
    ? path.resolve(rootDir, "pages")
    : path.resolve(rootDir, "src/pages")

  const pageFiles = glob.sync("**/*.{ts,tsx,js,jsx,cjs,mjs,mjsx,cjsx}", {
    cwd: pagesDir,
  })

  const manifest = {}

  for (const pageFile of pageFiles) {
    const relativePagePath = path.relative(process.cwd(), pageFile)
    const parsedPagePath = path.parse(relativePagePath)

    const isInvalidExtension = !VALID_EXTENSIONS.includes(parsedPagePath.ext)

    if (isInvalidExtension) {
      throw new Error(
        `Invalid file extension for page: ${pageFile}, must be one of: ${VALID_EXTENSIONS.join(
          ", ",
        )}. Found: ${pageName.ext}`,
      )
    }

    const filenameWithoutExtension = parsedPagePath.base
      .replace(parsedPagePath.ext, "")
      .replace("index", "")

    const filePathWithoutExtension = path.join(
      parsedPagePath.dir,
      filenameWithoutExtension,
    )

    manifest[`/${filePathWithoutExtension}`] = `pages/${relativePagePath}`
  }

  const manifestJSON = JSON.stringify(manifest, null, 2)

  const manifestFilePath = path.join(outputDir, "pages-manifest.json")

  // there is no need to write the manifest file
  // but it's good to have it for debugging purposes
  await fs.writeFile(manifestFilePath, manifestJSON)

  return manifest
}

function getStaticRoutesFiles({ nextless, staticFiles }) {
  return nextless
    ? ""
    : `,
   ${staticFiles
     .filter((fp) => fp.startsWith("static/"))
     .map(
       (fp) =>
         `"/_next/${fp}": serveStatic("${
           fp.split(".").slice(-1)[0]
         }", require("./generated_static/${fp}.ts").default)`,
     )}`
}

async function generateRouteFile({
  pagesDirRelativePath,
  pagesManifest,
  nextless,
  onlyApiFiles,
  staticFiles,
}) {
  const staticRoutesFiles = getStaticRoutesFiles({
    staticFiles,
    nextless,
  })

  return await prettier.format(
    `// @ts-nocheck
    import serveStatic from "./serve-static"
    export default {
  ${Object.entries(pagesManifest)
    .filter(([route, fp]) => {
      if (!nextless) {
        return true
      }

      if (!onlyApiFiles && !fp.startsWith("pages/api")) {
        throw new Error(
          `At the moment, only API routes are supported. Found: ${fp}`,
        )
      }

      if (
        (onlyApiFiles && !fp.startsWith("pages/api")) ||
        (!nextless && onlyApiFiles && !fp.startsWith("pages/api"))
      ) {
        return false
      }

      return true
    })
    .map(([route, fp]) => {
      const fpNoExt = fp.split(".").slice(0, -1).join(".")
      const fpExt = fpNoExt.split(".").slice(-1)[0]

      if (fp.startsWith("pages/api")) {
        const absolutePath = path.join(
          __dirname,
          "../",
          pagesDirRelativePath,
          fpNoExt,
        )

        return `"${route}": "${absolutePath}"`
      } else {
        return `"${route}": serveStatic("${fpExt}", require("./generated_static/server/${fp}.ts").default)`
      }
    })

    .join(",")}${staticRoutesFiles}
}

`,
    { semi: false, parser: "babel" },
  )
}

export async function generateNsmRoutes({ onlyApiFiles = false, skipBuild }) {
  let pagesDirRelativePath = skipBuild ? ".." : "."

  if (existsSync(path.join(__dirname, "../../src"))) {
    pagesDirRelativePath = skipBuild ? "../src" : "./src"
  }

  const nsmDir = path.resolve(__dirname, "../../.nsm")
  const rootDir = path.resolve(__dirname, "../..")

  const pagesManifest = await generateNsmPagesManifest(rootDir, nsmDir)

  const routesFile = await generateRouteFile({
    pagesDirRelativePath,
    pagesManifest,
    onlyApiFiles,
    nextless: true,
    staticFiles: "",
  })

  await fs.writeFile(
    path.resolve(__dirname, "../generated_routes.ts"),
    routesFile,
  )
}

async function generateRoutes({ onlyApiFiles = false }) {
  const nextDir = path.resolve(__dirname, "../../.next")
  const pagesDir = path.resolve(nextDir, "server/pages")
  const staticDir = path.resolve(nextDir, "static")

  const staticFiles = (await glob("**/*", { cwd: staticDir, nodir: true }))
    .map((fp) => `static/${fp}`)
    .concat(
      (await glob("**/*", { cwd: pagesDir, nodir: true }))
        .filter((fp) => !fp.startsWith("api"))
        .filter((fp) => !fp.endsWith(".nft.json"))
        .map((fp) => `server/pages/${fp}`),
    )
    .filter((fp) => fp.includes("."))

  const pagesManifest = JSON.parse(
    await fs.readFile(path.resolve(pagesDir, "../pages-manifest.json")),
  )

  for (const fp of staticFiles) {
    const fileContentB64 = (
      await fs.readFile(path.resolve(nextDir, fp))
    ).toString("base64")
    const outFilePath = path.resolve(
      __dirname,
      "../generated_static",
      `${fp}.ts`,
    )
    const outFileContent = `export default Buffer.from(\`${fileContentB64}\`, "base64")`
    await mkdirp(path.dirname(outFilePath))
    // Fixes race condition on MAC
    await new Promise((resolve) => setTimeout(resolve, 10))
    await fs.writeFile(outFilePath, outFileContent)
  }

  let pagesDirRelativePath = ".."
  if (existsSync(path.join(__dirname, "../../src/pages"))) {
    pagesDirRelativePath = "../src"
  }

  const routesFile = await generateRouteFile({
    pagesDirRelativePath,
    pagesManifest,
    onlyApiFiles,
    nextless: false,
    staticFiles,
  })

  await fs.writeFile(
    path.resolve(__dirname, "../generated_routes.ts"),
    routesFile,
  )
}

module.exports = { generateRoutes, generateNsmRoutes }

if (require.main === module) {
  generateRoutes()
}
