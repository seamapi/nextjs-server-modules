# NextJS Health Endpoint Module

## Installation

```bash
npm install nextjs-health-endpoint-module
```

## Usage

```ts
import healthEndpoint from "nextjs-health-endpoint-module"

const server = await healthEndpoint({ port: 3030 })

// You can now call http://localhost:3030/health

server.close()
```
