const path = require("path")
const prettier = require("prettier")
const fs = require("fs/promises")
const { existsSync } = require("fs")

async function copyNextjsConfig() {
  const nextConfigPath = path.resolve(__dirname, "../../next.config.js")

  let nextConfig = {}
  if (existsSync(nextConfigPath)) {
    try {
      nextConfig = require(nextConfigPath)
    } catch (errorA) {
      try {
        nextConfig = (await import(nextConfigPath)).default
      } catch (errorB) {
        console.error(errorA)
        console.error(errorB)
        throw new Error(`Failed to load ${nextConfigPath}`)
      }
    }

    if (typeof nextConfig === "function") {
      nextConfig = await nextConfig()
    }

    if (typeof nextConfig.rewrites === "function") {
      nextConfig.rewrites = await nextConfig.rewrites()
    }
  }

  const nextConfigFile = await prettier.format(
    `export default ${JSON.stringify(nextConfig)}`,
    { semi: false, parser: "babel" }
  )

  await fs.writeFile(
    path.resolve(__dirname, "../next.config.ts"),
    nextConfigFile
  )
}

module.exports = { copyNextjsConfig }

if (require.main === module) {
  copyNextjsConfig()
}
