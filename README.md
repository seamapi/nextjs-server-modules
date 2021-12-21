# NextJS Server Modules

A NextJS Server Module is a NextJS project that has been packaged to be easily
used as an npm module. You might use a server module to...

* Package a "fake" or "mock" server for easy use in test suites
* Allow another server to easily "call into" your NextJS server
* Improve the organization of a large project by organizing NextJS servers into
  server sub-components

## Usage

First, install with `npm install nextjs-server-module`

You can now add a build script or just run `nsm build`

The build process will output a `dist/index.js` file which can be used to
create your server or invoke requests against it
