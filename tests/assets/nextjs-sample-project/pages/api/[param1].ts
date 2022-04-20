import { NextApiHandler } from "next"

const handler: NextApiHandler = (req, res) =>
  res.status(200).json({
    route: "/api/[param1].ts",
    query: req.query,
  })

export default handler
