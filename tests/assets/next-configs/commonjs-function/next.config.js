module.exports = async () => ({
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:path*",
          destination: "/api/:path*",
        },
      ],
    }
  },
})
