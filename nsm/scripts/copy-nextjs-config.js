const path = require("path")
const prettier = require("prettier")
const fs = require("fs/promises")
const { existsSync } = require("fs")
const { pathToFileURL } = require("url")

// A module namespace is not the config, the config is its default export.
// The require below returns a namespace for an ES module in two cases: since
// Node.js 22.12 require of an ES module succeeds and returns one, and the nsm
// bin registers esbuild-runner, which transpiles an ES module to CommonJS and
// marks the result with __esModule. Reading the config off the namespace left
// rewrites undefined, which silently dropped it from the generated config.
const interopDefault = (value) => {
  if (value == null) return value

  const is_namespace =
    value[Symbol.toStringTag] === "Module" || value.__esModule === true

  return is_namespace && "default" in value ? value.default : value
}

async function loadNextjsConfig(nextConfigPath) {
  let nextConfig
  try {
    nextConfig = interopDefault(require(nextConfigPath))
  } catch (errorA) {
    try {
      nextConfig = interopDefault(await import(pathToFileURL(nextConfigPath)))
    } catch (errorB) {
      console.error(errorA)
      console.error(errorB)
      throw new Error(`Failed to load ${nextConfigPath}`)
    }
  }

  if (typeof nextConfig === "function") {
    nextConfig = await nextConfig()
  }

  // A module namespace is frozen, so resolve rewrites into a copy.
  if (typeof nextConfig.rewrites === "function") {
    nextConfig = { ...nextConfig, rewrites: await nextConfig.rewrites() }
  }

  return nextConfig
}

async function copyNextjsConfig() {
  const nextConfigPath = path.resolve(__dirname, "../../next.config.js")

  const nextConfig = existsSync(nextConfigPath)
    ? await loadNextjsConfig(nextConfigPath)
    : {}

  const nextConfigFile = await prettier.format(
    `export default ${JSON.stringify(nextConfig)}`,
    { semi: false, parser: "babel" },
  )

  await fs.writeFile(
    path.resolve(__dirname, "../next.config.ts"),
    nextConfigFile,
  )
}

module.exports = { copyNextjsConfig, loadNextjsConfig }

if (require.main === module) {
  copyNextjsConfig()
}
