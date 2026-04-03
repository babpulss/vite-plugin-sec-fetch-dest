# vite-plugin-sec-fetch-dest

Vite plugin that patches missing `Sec-Fetch-Dest` headers on dev server requests.

Fixes **TanStack Start + Nitro** dev server module loading failures when accessing via **IP address** or **Safari**.

## The Problem

Nitro's dev middleware uses the `Sec-Fetch-Dest` header to decide whether a request is a JS module (handled by Vite) or a page route (handled by Nitro SSR).

**Browsers don't always send this header:**

| Browser | localhost | IP address (e.g. 192.168.0.64) |
|---------|-----------|-------------------------------|
| Chrome  | `script` ✓ | missing ✗ |
| Safari  | missing ✗ | missing ✗ |

Without the header, Nitro intercepts JS/TS module requests. Route files like `$id.edit.tsx` break because Nitro interprets `$id` as a route parameter (→ `undefined` → 404).

See [TanStack/router#7095](https://github.com/TanStack/router/issues/7095) for details.

## Install

```bash
npm install -D vite-plugin-sec-fetch-dest
```

## Usage

Add it to your `vite.config.ts` **before** `nitro()`:

```ts
import { secFetchDest } from 'vite-plugin-sec-fetch-dest'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,  // enable IP access
  },
  plugins: [
    tanstackStart(),
    viteReact(),
    secFetchDest(),  // ← must be before nitro()
    nitro(),
  ],
})
```

## Also: Secure cookie fix

If login doesn't work on IP/Safari, your session cookie likely has `Secure` flag (default in h3). Add this to your session config:

```ts
useSession({
  password: process.env.SESSION_SECRET!,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
})
```

See [TanStack/router#3492](https://github.com/TanStack/router/issues/3492).

## License

MIT
