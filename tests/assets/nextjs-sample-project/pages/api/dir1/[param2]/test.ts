export default (req, res) =>
  res.status(200).json({
    route: "/api/dir1/[param2]/test.ts",
    query: req.query,
  })
