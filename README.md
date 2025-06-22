# Excalidraw App to experiment with Web Sockets through Cloudflare Durable Objects

Experiment with web sockets using Cloudflare Durable Objects through collaborative Excalidraw Nextjs Apps deployed on Cloudflare Workers
[Live Demo](https://excalidraw.filiba.workers.dev/a)

Based on: https://www.youtube.com/watch?v=qF2PuYnBahw

## Monorepo to share types between the client and server

Root directory (downloads all the node_modules in their respective directories)

```bash
pnpm i
```

Build common types:

```bash
cd packages/schemas && pnpm build
```

Start Server (should run at http://localhost:8787)

```bash
cd apps/server && pnpm dev
```

In `.env.development`: add `NEXT_PUBLIC_WS_CLIENT=ws://localhost:8787`

Start Client

```bash
cd apps/client && pnpm dev
```

Should run at: http://localhost:3000
Add an identifier at the end to distinguish between different 'rooms'
e.g. http://localhost:3000/a

Open an incognito tab to the same url to view collaboration through web sockets
