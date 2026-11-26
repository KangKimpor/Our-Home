import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

function createBuildVersion(): { version: string; builtAt: string } {
  const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
    version?: string;
  };
  const pkgVersion = pkg.version || '0.0.0';
  let sha = '';
  try {
    sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    // Git metadata may be absent in packaged builds.
  }
  const stamp = Date.now().toString(36);
  const version = sha ? `${pkgVersion}-${sha}-${stamp}` : `${pkgVersion}-${stamp}`;
  return { version, builtAt: new Date().toISOString() };
}

function appVersionPlugin(): Plugin {
  const meta = createBuildVersion();
  const payload = JSON.stringify(meta, null, 2);

  return {
    name: 'our-home-app-version',
    config() {
      return {
        define: {
          __APP_VERSION__: JSON.stringify(meta.version),
        },
      };
    },
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'meta',
            attrs: { name: 'app-version', content: meta.version },
            injectTo: 'head',
          },
        ],
      };
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: payload,
      });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0];
        if (pathname === '/version.json') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          for (const [k, v] of Object.entries(NO_CACHE_HEADERS)) res.setHeader(k, v);
          res.end(payload);
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0];
        if (pathname === '/' || pathname === '/index.html' || pathname === '/version.json' || pathname === '/sw.js') {
          for (const [k, v] of Object.entries(NO_CACHE_HEADERS)) res.setHeader(k, v);
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), appVersionPlugin()],
  build: { target: 'es2020' },
});
