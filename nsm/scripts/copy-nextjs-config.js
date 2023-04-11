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
    } catch (error) {
      nextConfig = await import(nextConfigPath)
      if (!nextConfig) throw error
    }

    if (typeof nextConfig === "function") {
      nextConfig = await nextConfig()
    }

    if (typeof nextConfig.rewrites === "function") {
      nextConfig.rewrites = await nextConfig.rewrites()
    }
  }

  const nextConfigFile = prettier.format(
    `export default ${JSON.stringify(nextConfig)}`,
    { semi: false }
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
