import { defineConfig } from 'vite';

export default defineConfig({
  // Relative assets keep both /v05/ and /v051/ GitHub Pages previews self-contained.
  base: './',
  esbuild: { jsxInject: `import React from 'react'` }
});
