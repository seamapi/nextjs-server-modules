// https://github.com/vercel/next.js/blob/bb6d4d71fd419b64e2a3ce4d3496f2150f9ff86b/packages/next/shared/lib/utils.ts
import { ServerResponse, IncomingMessage } from "http"

type Send<T> = (body: T) => void

export interface NextApiRequest extends IncomingMessage {
  /**
   * Object of `query` values from url
   */
  query: {
    [key: string]: string | string[]
  }
  /**
   * Object of `cookies` from header
   */
  cookies: {
    [key: string]: string
  }

  body: any

  env: { [key: string]: string }

  // preview?: boolean
  /**
   * Preview data set on the request, if any
   * */
  // previewData?: PreviewData
}

export type NextApiResponse<T = any> = ServerResponse & {
  /**
   * Send data `any` data in response
   */
  send: Send<T>
  /**
   * Send data `json` data in response
   */
  json: Send<T>
  status: (statusCode: number) => NextApiResponse<T>
  redirect(url: string): NextApiResponse<T>
  redirect(status: number, url: string): NextApiResponse<T>

  /**
   * Set preview data for Next.js' prerender mode
   */
  setPreviewData: (
    data: object | string,
    options?: {
      /**
       * Specifies the number (in seconds) for the preview session to last for.
       * The given number will be converted to an integer by rounding down.
       * By default, no maximum age is set and the preview session finishes
       * when the client shuts down (browser is closed).
       */
      maxAge?: number
    }
  ) => NextApiResponse<T>
  clearPreviewData: () => NextApiResponse<T>
}

export type NextApiHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<T>
) => void | Promise<void>

export type RouteHas =
  | {
      type: "header" | "query" | "cookie"
      key: string
      value?: string
    }
  | {
      type: "host"
      key?: undefined
      value: string
    }

export type Rewrite = {
  source: string
  destination: string
  basePath?: false
  locale?: false
  has?: RouteHas[]
}
