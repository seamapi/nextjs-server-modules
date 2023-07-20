const yargs = require("yargs")
const { hideBin } = require("yargs/helpers")
const path = require("path")
const { build } = require("./build")
const { init } = require("./init")

async function main() {
  const argv = yargs(hideBin(process.argv))
    .command("init", "Copy empty .nsm directory", (yargs) => {})
    .command("build", "build .next and .nsm", (yargs) => {})
    .option("verbose", {
      alias: "v",
      type: "boolean",
      description: "Show verbose output",
    })
    .option("only-api-files", {
      type: "boolean",
      default: false,
      description: "Ignore files that are not in pages/api",
    })
    .option("skip-build", {
      type: "boolean",
      default: false,
      description: "Skip the build step (nextjs and nextless)",
    })
    .option("nextless", {
      type: "boolean",
      default: false,
      description: "build with ts-up instead of next build",
    })
    .option("skip-next-build", {
      deprecated: true,
      description: "Deprecated. Use --skip-build and/or --nextless instead",
    })
    .help().argv

  const cmd = argv._[0]

  if (argv["skip-next-build"]) {
    console.log("Deprecated. Use --skip-build and/or --nextless instead")
    return
  }

  switch (cmd) {
    case "init": {
      await init({ dir: path.resolve("."), verbose: argv.verbose })
      break
    }
    case "build": {
      await build({
        dir: path.resolve("."),
        verbose: argv.verbose,
        skipNext: argv["skip-build"],
        nextless: argv["nextless"],
        onlyApiFiles: argv["only-api-files"],
      })
      break
    }
    default: {
      console.log("Unknown command: ", cmd)
    }
  }
}

module.exports = { default: main }

if (!module.parent) {
  main()
}
