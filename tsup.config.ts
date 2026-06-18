import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['script.ts'],
  outDir: 'dist',
  format: ['esm', 'cjs', 'iife'],
  globalName: 'cropo',
  dts: true,
  sourcemap: true,
  minify: true,
  clean: true
})
