export default {
  "/_app": require("../.next/server/pages/_app.js"),
  "/_document": require("../.next/server/pages/_document.js"),
  "/_error": require("../.next/server/pages/_error.js"),
  "/api/[param1]": require("../.next/server/pages/api/[param1].js"),
  "/api/dir1/[param2]/test": require("../.next/server/pages/api/dir1/[param2]/test.js"),
  "/api/dir2/[[...param3]]": require("../.next/server/pages/api/dir2/[[...param3]].js"),
  "/api/health": require("../.next/server/pages/api/health.js"),
}
