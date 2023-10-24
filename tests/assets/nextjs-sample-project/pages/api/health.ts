import { NextApiHandler } from "next"

const handler: NextApiHandler = async (req, res) => {
  res.status(200).end("nextjs-health-endpoint-module healthy!")
}

export default handler
