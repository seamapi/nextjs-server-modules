export const config = {
  runtime: "edge"
}

export default async function handler(request) {
  let areNodeBuiltinsAvailable = true
  try {
    // Need to assign this to a variable instead of `import("node:fs")` so an error isn't thrown during the normal build
    const moduleToAttemptToImport = "node:fs"
    await import(moduleToAttemptToImport)
  } catch {
    areNodeBuiltinsAvailable = false
  }

  return Response.json({
    isFetchAvailable: typeof fetch === "function",
    areNodeBuiltinsAvailable,
    requestUrl: request.url,
  });
}

// todo: migrate to .ts
