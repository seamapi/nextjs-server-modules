import test from "ava"
import { parseUrl } from "nsm/nextjs-middleware/parse-url"
import resolveRewrites from "nsm/nextjs-middleware/resolve-rewrites"

test("resolve rewrites /health -> /api/health", async (t) => {
  const result = resolveRewrites(
    "/health",
    ["/api/health"],
    {
      afterFiles: [
        // Nextjs by default requires a /api prefix, let's remove that
        {
          source: "/:path*",
          destination: "/api/:path*",
        },
      ],
      beforeFiles: [],
      fallback: [],
    },
    parseUrl("http://localhost:3000/health") as any,
    (s) => s,
  )

  t.is(result.resolvedHref, "/api/health")
})
