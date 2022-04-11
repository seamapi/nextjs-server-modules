# NextJS Server Modules

A NextJS Server Module is a NextJS project that has been packaged to be easily
used as an npm module. You might use a server module to...

- Package a "fake" or "mock" server for easy use in test suites
- Allow another server to easily "call into" your NextJS server
- Improve the organization of a large project by organizing NextJS servers into
  server sub-components

The `nextjs-server-module` cli will help you create a custom nextjs runtime
to run your projects with, so they can be run without nextjs at runtime.

## Usage

First, install with `npm install nextjs-server-modules`

You can now add a build script or just run `nsm build`

The build process will output a `.nsm/index.ts` file which can be used to
create your server or invoke requests against it

```ts
import myNextJSModule from "./.nsm"

const server = await myNextJSModule({ port: 3030 })

// your server is running on localhost:3030!

server.close()
```

### Middlewares

You can provide middlewares to your server like so:

```ts
import myNextJSModule from "./.nsm"

const myMiddleware = (next) => (req, res) => {
  req.token = req.headers.get("authorization").split("Bearer ")?.[1]
  return next(req, res)
}

const server = await myNextJSModule({
  port: 3030,
  middlewares: [myMiddleware],
})

// your server is running on localhost:3030!

server.close()
```

## Internal: How it Works

> Not all NextJS features are currently supported. Particularly:
>
> - SSR
> - getStaticProps

We build the api endpoints and export static pages with `next build`. We then
analyze `.next/server/pages/api` to get all the api routes to server.

We then construct a main export file that knows how to parse `next.config.js`
and route to the correct files, which we've statically analyzed and are included
in the generated `dist/index.js` file.

## FAQ

### Why can't Next.js bundle into an npm module?

You can bundle nextjs into npm modules, but some static analysis isn't available
since nextjs uses the directory structure to determine what to load in at
runtime.

You'll also have problems running a `next` server within a Vercel endpoint,
because some vercel optimizations get rid of some webpack/next modules as an
optimization.

### Why is my module bigger?

NSM base64 encodes static files so that they're bundleable, it's very inefficient.
