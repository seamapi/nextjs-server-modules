import { NextApiHandler } from "next"

const streamToString = (stream: NodeJS.ReadableStream) => {
  return new Promise<string>((resolve, reject) => {
    const chunks: string[] = []
    stream.on("data", (chunk) => {
      chunks.push(chunk.toString())
    })
    stream.on("end", () => {
      resolve(chunks.join(""))
    })
    stream.on("error", (err) => {
      reject(err)
    })
  })
}

const handler: NextApiHandler = async (req, res) => {
  try {
    const data = await streamToString(req)
    res.status(200).json({
      route: "/api/streaming.ts",
      data,
    })
  } catch (error) {
    res.status(500).json({
      route: "/api/streaming.ts",
      error: (error as Error).message,
    })
  }
}

export default handler

export const config = {
  api: {
    bodyParser: false,
  },
}
