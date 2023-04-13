// @ts-nocheck
// https://github.com/vercel/next.js/blob/e2c5952ef2fa03d4fb6dc4cb7ff50d26c76e7ea8/packages/next/shared/lib/utils.ts
import type { ServerResponse, IncomingMessage } from "http"

/**
 * Next `API` route request
 */
export interface NextApiRequest extends IncomingMessage {
  /**
   * Object of `query` values from url
   */
  query: Partial<{
    [key: string]: string | string[]
  }>
  /**
   * Object of `cookies` from header
   */
  cookies: Partial<{
    [key: string]: string
  }>

  body: any

  env: Env

  preview?: boolean
  /**
   * Preview data set on the request, if any
   * */
  previewData?: PreviewData
}

/**
 * Send body of response
 */
type Send<T> = (body: T) => void

/**
 * Next `API` route response
 */
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
      /**
       * Specifies the path for the preview session to work under. By default,
       * the path is considered the "default path", i.e., any pages under "/".
       */
      path?: string
    }
  ) => NextApiResponse<T>

  /**
   * Clear preview data for Next.js' prerender mode
   */
  clearPreviewData: (options?: { path?: string }) => NextApiResponse<T>

  /**
   * @deprecated `unstable_revalidate` has been renamed to `revalidate`
   */
  unstable_revalidate: () => void

  revalidate: (
    urlPath: string,
    opts?: {
      unstable_onlyGenerated?: boolean
    }
  ) => Promise<void>
}

/**
 * Next `API` route handler
 */
export type NextApiHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<T>
) => unknown | Promise<unknown>

// https://github.com/vercel/next.js/blob/e2c5952ef2fa03d4fb6dc4cb7ff50d26c76e7ea8/packages/next/lib/load-custom-routes.ts

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
  missing?: RouteHas[]
}

// https://github.com/vercel/next.js/blob/e2c5952ef2fa03d4fb6dc4cb7ff50d26c76e7ea8/packages/next/types/index.d.ts
export type PreviewData = string | false | object | undefined

// https://github.com/vercel/next.js/blob/e2c5952ef2fa03d4fb6dc4cb7ff50d26c76e7ea8/packages/next-env/index.ts
export type Env = { [key: string]: string | undefined }
