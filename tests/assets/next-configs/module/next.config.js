export default {
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
}
