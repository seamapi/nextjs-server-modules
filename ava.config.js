module.exports = {
  files: ["tests/**/*.test.ts"],
  extensions: ["ts"],
  timeout: "5m",
  require: ["esbuild-runner/register"]
}
