import path from "path"

export default {}

/*

Example of what this may look like after generation:

export default {
  "/_app.js": path.resolve(__dirname, "../.next/server/pages/_app.js"),
  "/_document.js": path.resolve(
    __dirname,
    "../.next/server/pages/_document.js"
  ),
  "/_error.js": path.resolve(__dirname, "../.next/server/pages/_error.js"),
  "/404.html": path.resolve(__dirname, "../.next/server/pages/404.html"),
  "/500.html": path.resolve(__dirname, "../.next/server/pages/500.html"),
  "/api/[param1]": require("../.next/server/pages/api/[param1].js"),
  "/api/dir1/[param2]/test": require("../.next/server/pages/api/dir1/[param2]/test.js"),
  "/api/dir2/[[...param3]]": require("../.next/server/pages/api/dir2/[[...param3]].js"),
  "/api/health": require("../.next/server/pages/api/health.js"),
  "/somepage.html": path.resolve(
    __dirname,
    "../.next/server/pages/somepage.html"
  ),
}

*/
