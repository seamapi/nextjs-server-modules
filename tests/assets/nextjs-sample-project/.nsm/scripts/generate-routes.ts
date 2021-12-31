import glob from "glob-promise"
import path from "path"
import rimraf from "rmfr"
import copyDir from "recursive-copy"
import prettier from "prettier"
import fs from "fs/promises"

async function main() {
  const pagesDir = path.resolve(__dirname, "../../.next/server/pages")
  const allPageFiles = await glob("**/*.js", { cwd: pagesDir })

  const routesFile = prettier.format(
    `export default { ${allPageFiles
      .map(
        (fp) =>
          `"/${fp.split(".js")[0]}": require("../.next/server/pages/${fp}")`
      )
      .join(",")} }`,
    { semi: false }
  )

  await fs.writeFile(
    path.resolve(__dirname, "../generated_routes.ts"),
    routesFile
  )
}

if (!module.parent) {
  main()
}
