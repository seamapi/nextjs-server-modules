#!/usr/bin/env node

require("esbuild-runner/register")
require("./lib/cli.js")
  .default()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
