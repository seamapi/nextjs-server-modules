const path = require("path")

module.exports = {
  async rewrites() {
    return {
      afterFiles: [
        // Nextjs by default requires a /api prefix, let's remove that
        {
          source: "/:path*",
          destination: "/api/:path*",
        },
      ],
    }
  },
}
