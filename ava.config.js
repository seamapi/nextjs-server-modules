module.exports = {
  files: ["tests/**/*.test.ts"],
  extensions: ["ts"],
  timeout: "2m",
  require: ["esbuild-runner/register"],
  ignoredByWatcher: ["**/.next/**", "**/.nsm/**"],
}
