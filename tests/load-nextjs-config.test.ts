import test from "ava"
import { loadNextjsConfig } from "nsm/scripts/copy-nextjs-config"
import path from "path"

const configPath = (name: string) =>
  path.resolve(__dirname, "assets", "next-configs", name, "next.config.js")

const expected_rewrites = {
  beforeFiles: [
    {
      source: "/:path*",
      destination: "/api/:path*",
    },
  ],
}

test("loads a CommonJS config", async (t) => {
  const config = await loadNextjsConfig(configPath("commonjs"))

  t.true(config.reactStrictMode)
  t.deepEqual(config.rewrites, expected_rewrites)
})

test("loads a CommonJS config exporting a function", async (t) => {
  const config = await loadNextjsConfig(configPath("commonjs-function"))

  t.true(config.reactStrictMode)
  t.deepEqual(config.rewrites, expected_rewrites)
})

// The nsm bin registers esbuild-runner, which transpiles an ES module to
// CommonJS, and require of an ES module returns a module namespace since
// Node.js 22.12. Both give the require in loadNextjsConfig a namespace instead
// of the config, and reading rewrites off the namespace silently dropped it.
test("loads an ES module config", async (t) => {
  const config = await loadNextjsConfig(configPath("module"))

  t.true(config.reactStrictMode)
  t.deepEqual(config.rewrites, expected_rewrites)
})
