import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  esbuild: {
    jsxInject: `import React from 'react'`
  }
});
