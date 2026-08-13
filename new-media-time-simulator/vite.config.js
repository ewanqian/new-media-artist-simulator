import { defineConfig } from 'vite';

function localPreviewPathAliases() {
  return {
    name: 'local-preview-path-aliases',
    configurePreviewServer(server) {
      server.middlewares.use((request, _response, next) => {
        const assetPath = request.url?.match(/^\/(?:v05|v051)(\/assets\/.*)$/)?.[1];
        if (assetPath) request.url = assetPath;
        next();
      });
    }
  };
}

export default defineConfig({
  // Relative assets keep both /v05/ and /v051/ GitHub Pages previews self-contained.
  base: './',
  esbuild: { jsxInject: `import React from 'react'` },
  plugins: [localPreviewPathAliases()]
});
