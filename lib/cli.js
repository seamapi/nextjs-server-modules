const yargs = require("yargs")
const { hideBin } = require("yargs/helpers")
const path = require("path")
const { build } = require("./build")

async function main() {
  const argv = yargs(hideBin(process.argv))
    .command("build", "build .next and .nsm", (yargs) => {})
    .help().argv

  const cmd = argv._[0]
  switch (cmd) {
    case "build": {
      await build({ dir: path.resolve(".") })
      break
    }
  }
}

module.exports = { default: main }

if (!module.parent) {
  main()
}
