import { NextFetchEvent, NextRequest, NextResponse } from "next/server"

export const config = {
  runtime: "edge"
}

export default async function handler(request: NextRequest, event: NextFetchEvent) {
  let areNodeBuiltinsAvailable = true
  try {
    // Need to assign this to a variable instead of `import("node:fs")` so an error isn't thrown during the normal build
    const moduleToAttemptToImport = "node:fs"
    await import(moduleToAttemptToImport)
  } catch {
    areNodeBuiltinsAvailable = false
  }

  return NextResponse.json({
    isFetchAvailable: typeof fetch === "function",
    areNodeBuiltinsAvailable,
    requestUrl: request.url,
    sourcePageFromEvent: event.sourcePage,
    fooBarEnvVar: process.env.FOO_BAR
  }, {
    headers: {
      "x-custom-header": "foo"
    },
    status: 201
  });
}
