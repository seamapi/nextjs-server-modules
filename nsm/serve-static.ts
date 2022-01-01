import mime from "mime-types"

export default (ext, content) => (req, res) => {
  const contentType = mime.contentType(ext)
  if (contentType) {
    res.setHeader("Content-Type", contentType)
  }
  res.statusCode = 200
  res.end(content)
}
