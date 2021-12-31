export default (req, res) =>
  res.status(200).json({
    route: "/api/[param1].ts",
    query: req.query,
  })
