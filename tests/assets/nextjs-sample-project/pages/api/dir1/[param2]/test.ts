import { NextApiHandler } from "next"

const handler: NextApiHandler = (req, res) =>
  res.status(200).json({
    route: "/api/dir1/[param2]/test.ts",
    query: req.query,
  })

export default handler
