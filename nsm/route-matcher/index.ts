// @ts-nocheck
import { getRouteRegex } from "./route-regex"
import { getRouteMatcherFunc } from "./get-route-matcher-func"

export default (routeMapping: any) => {
  // convert each route to a regex
  const routes: any[] = []
  for (const [fsPath, serverFunc] of Object.entries(routeMapping)) {
    const routeRegex = getRouteRegex(fsPath)
    routes.push({
      fsPath,
      routeRegex,
      matcherFunc: getRouteMatcherFunc(routeRegex),
      serverFunc,
      // TODO use whatever priority func nextjs uses
      priority: -Object.keys(routeRegex.groups).length,
    })
  }

  routes.sort((a, b) => b.priority - a.priority)

  // TODO sort routes to fix precedence

  return (incomingPath: string) => {
    for (const { serverFunc, matcherFunc, fsPath } of routes) {
      const match = matcherFunc(incomingPath)
      if (match) {
        return { serverFunc, match, fsPath }
      }
    }
    return null
  }
}
