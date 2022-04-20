import { NextApiHandler } from "next";

const handler: NextApiHandler = (req, res) =>
  res.status(200).json({
    route: "/api/dir2/[[...param3]].ts",
    query: req.query,
    requestUrl: req.url
  })

export default handler
