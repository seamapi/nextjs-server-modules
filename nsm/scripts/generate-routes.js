const { glob } = require("glob")
const { mkdirp } = require("mkdirp")
const path = require("path")
const prettier = require("prettier")
const { existsSync } = require("fs")
const fs = require("fs/promises")

async function generatePagesManifest(rootDir, outputDir) {
  const pagesDir = existsSync(path.resolve(rootDir, "pages")) ? path.resolve(rootDir, "pages") : path.resolve(rootDir, "src/pages");
  const pageFiles = glob.sync('**/*.{ts,tsx,js,jsx}', { cwd: pagesDir });
  const manifest = {}

  for (const pageFile of pageFiles) {
    const relativePagePath = path.relative(process.cwd(), pageFile);
    const parsedPagePath = path.parse(relativePagePath);
    
    const isInvalidExtension = !['.tsx', '.jsx', '.ts', '.js'].includes(parsedPagePath.ext);
    if (isInvalidExtension) {
      throw new Error(`Invalid file extension for page: ${pageFile}, must be one of: .tsx, .jsx, .ts, .js. Found: ${pageName.ext}`);
    }
    
    const filenameWithoutExtension = parsedPagePath.base.replace(parsedPagePath.ext, '');

    const filePathWithoutExtension = path.join(parsedPagePath.dir, filenameWithoutExtension);
    
    manifest[`/${filePathWithoutExtension}`] = `pages/${relativePagePath}`;
  }

  const manifestJSON = JSON.stringify(manifest, null, 2);

  const manifestFilePath = path.join(outputDir, 'pages-manifest.json');
  
  await fs.writeFile(
    manifestFilePath, manifestJSON
  )

  console.log(`Pages manifest generated at: ${manifestFilePath}`);

  return manifest;
}


async function generateRoutes() {
  // const nextDir = path.resolve(__dirname, "../../.next")
  const nextDir = path.resolve(__dirname, "../../.next")
  // const pagesDir = path.resolve(nextDir, "server/pages")
  // const staticDir = path.resolve(nextDir, "static")

  // const staticFiles = (await glob("**/*", { cwd: staticDir, nodir: true }))
  //   .map((fp) => `static/${fp}`)
  //   .concat(
  //     (await glob("**/*", { cwd: pagesDir, nodir: true }))
  //       .filter((fp) => !fp.startsWith("api"))
  //       .filter((fp) => !fp.endsWith(".nft.json"))
  //       .map((fp) => `server/pages/${fp}`)
  //   )
  //   .filter((fp) => fp.includes("."))

  // const pagesManifest = JSON.parse(
  //   await fs.readFile(path.resolve(pagesDir, "../pages-manifest.json"))
  // )

  // for (const fp of staticFiles) {
  //   const fileContentB64 = (
  //     await fs.readFile(path.resolve(nextDir, fp))
  //   ).toString("base64")
  //   const outFilePath = path.resolve(
  //     __dirname,
  //     "../generated_static",
  //     `${fp}.ts`
  //   )
  //   const outFileContent = `export default Buffer.from(\`${fileContentB64}\`, "base64")`
  //   await mkdirp(path.dirname(outFilePath))
  //   // Fixes race condition on MAC
  //   await new Promise((resolve) => setTimeout(resolve, 10))
  //   await fs.writeFile(outFilePath, outFileContent)
  // }

  let pagesDirRelativePath = ".."
  if (existsSync(path.join(__dirname, "../../src/pages"))) {
    pagesDirRelativePath = "../src"
  }

  const nsmDir = path.resolve(__dirname, "../../.nsm")
  const rootDir = path.resolve(__dirname, '../..')

  const pagesManifest = await generatePagesManifest(rootDir, nsmDir);

  const routesFile = prettier.format(
    `// @ts-nocheck
    import serveStatic from "./serve-static"
    export default {
  ${Object.entries(pagesManifest)
    .map(([route, fp]) => {
      console.log({ route, fp })
      const fpNoExt = fp.split(".").slice(0, -1).join(".")
      const fpExt = fpNoExt.split(".").slice(-1)[0]
      return fp.startsWith("pages/api")
        ? `"${route}": require("${pagesDirRelativePath}/${fpNoExt}")`
        : `"${route}": serveStatic("${fpExt}", require("./generated_static/server/${fp}.ts").default)`
    })
    .join(",")}
}

`,
    { semi: false, parser: "babel" }
  )
  // ${staticFiles
  //   .filter((fp) => fp.startsWith("static/"))
  //   .map(
  //     (fp) =>
  //       `"/_next/${fp}": serveStatic("${
  //         fp.split(".").slice(-1)[0]
  //       }", require("./generated_static/${fp}.ts").default)`
    // )}

  await fs.writeFile(
    path.resolve(__dirname, "../generated_routes.ts"),
    routesFile
  )
}

module.exports = { generateRoutes }

if (require.main === module) {
  generateRoutes()
}
