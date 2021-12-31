import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import path from "path"
import build from "./build"

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

export default main

if (!module.parent) {
  main()
}
