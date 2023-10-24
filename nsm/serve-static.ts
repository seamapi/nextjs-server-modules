// @ts-nocheck
import mime from "mime-types"
import type { NextApiHandler } from "./types/nextjs"

const serveStatic = (ext: string, content: any) =>
  ((req, res) => {
    const contentType = mime.lookup(ext)
    if (contentType) {
      res.setHeader("Content-Type", contentType)
    }
    res.statusCode = 200
    res.end(content)
  }) as NextApiHandler

export default serveStatic
