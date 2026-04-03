import type { IncomingMessage } from 'node:http'
import type { Plugin } from 'vite'

const JS_RE = /\.[mc]?[jt]sx?(\?|$)/

/**
 * Vite plugin that patches missing `Sec-Fetch-Dest` headers on dev server requests.
 *
 * Browsers don't send `Sec-Fetch-Dest: script` for module imports when:
 * - The origin is an IP address (e.g. `http://192.168.0.64:3000`) — Chrome, Firefox
 * - Any non-HTTPS origin — Safari
 *
 * Nitro's dev middleware relies on this header to distinguish module requests from
 * SSR page requests. Without it, Nitro intercepts JS/TS module imports and processes
 * them as routes — breaking dynamic route files like `$id.edit.tsx` where `$id` gets
 * resolved to `undefined`.
 *
 * This plugin injects `Sec-Fetch-Dest: script` for JS/TS file requests before
 * Nitro's middleware sees them.
 *
 * @see https://github.com/TanStack/router/issues/7095
 *
 * @example
 * ```ts
 * import { secFetchDest } from 'vite-plugin-sec-fetch-dest'
 *
 * export default defineConfig({
 *   plugins: [
 *     tanstackStart(),
 *     viteReact(),
 *     secFetchDest(),  // must be before nitro()
 *     nitro(),
 *   ],
 * })
 * ```
 */
export function secFetchDest(): Plugin {
  return {
    name: 'vite-plugin-sec-fetch-dest',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, _res, next) => {
        if (
          !req.headers['sec-fetch-dest'] &&
          req.url &&
          JS_RE.test(req.url)
        ) {
          req.headers['sec-fetch-dest'] = 'script'
        }
        next()
      })
    },
  }
}

export default secFetchDest
