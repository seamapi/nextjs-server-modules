const glob = require("glob-promise")
const path = require("path")
const rimraf = require("rmfr")
const copyDir = require("recursive-copy")
const prettier = require("prettier")
const fs = require("fs/promises")

export interface BuildOptions {
  dir: string
  outDir: string
}
export const build = async ({ dir, outDir }: BuildOptions) => {
  outDir = path.resolve(outDir)
  console.log({ dir, outDir })
  try {
    require.resolve(`${dir}/node_modules/next`)
  } catch (e) {
    throw new Error(
      `Couldn't find next module, it might not be installed in your project. I checked the path: "${dir}/node_modules/next"`
    )
  }
  const nextBuild = require(`${dir}/node_modules/next/dist/build/index`).default

  await nextBuild(dir, null, false, false, false)

  const nextDir = `${dir}/.next`
  const staticDir = `${nextDir}/static`
  const pagesDir = `${nextDir}/server/pages`
  const packageJSON = JSON.parse(await fs.readFile(`${dir}/package.json`))

  await rimraf(outDir)
  await copyDir(nextDir, path.join(outDir, ".next"))
  await copyDir(`${dir}/node_modules`, path.join(outDir, "node_modules"))

  await fs.writeFile(
    path.resolve(outDir, "package.json"),
    JSON.stringify(packageJSON)
  )

  /*

  Example .next directory structure:

  server/pages/api/health.js
  server/pages/api/health.nft.json
  server/pages/404.html
  server/pages/500.html
  server/pages/_error.js

  static/chunks/frame-e02.js
  static/chunks/pages/file.js

  */

  const allPageFiles = await glob("**/*.js", { cwd: pagesDir })

  const routesFile = prettier.format(
    `export default { ${allPageFiles
      .map(
        (fp) => `"${fp.split(".js")[0]}": require("./.next/server/pages/${fp}")`
      )
      .join(",")} }`,
    { semi: false }
  )

  await fs.writeFile(path.resolve(outDir, "routes.js"), routesFile)

  console.log(routesFile)
}

export default build
