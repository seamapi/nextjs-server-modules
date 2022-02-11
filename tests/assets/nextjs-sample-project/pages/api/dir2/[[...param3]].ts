export default (req, res) =>
  res.status(200).json({
    route: "/api/dir2/[[...param3]].ts",
    query: req.query,
    requestUrl: req.url
  })
