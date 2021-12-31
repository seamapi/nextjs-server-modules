import { getRouteRegex } from "./route-regex"

export default (routeMapping, path) => {
  // convert each route to a regex
  const routes = []
  for (const [fsPath, serverFunc] of Object.entries(routeMapping)) {
    console.log(getRouteRegex(fsPath))
  }
}
