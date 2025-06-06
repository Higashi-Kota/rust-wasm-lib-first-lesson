import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: 'node22',
  external: [],
  bundle: true,
  treeshake: true,
  platform: 'neutral',
  esbuildOptions(options) {
    options.conditions = ['import', 'module', 'default']
  },
  onSuccess: async () => {
    console.log('✅ @nap5/gnrng-id built successfully!')
  },
})
